package com.trakz.pos.plugins

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.util.Base64
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.IOException
import java.io.OutputStream
import java.util.UUID

@CapacitorPlugin(name = "BluetoothPrinter")
class BluetoothPrinterPlugin : Plugin() {

    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bluetoothSocket: BluetoothSocket? = null
    private var outputStream: OutputStream? = null
    private var connectedDeviceName: String? = null
    private var connectedDeviceAddress: String? = null

    // Standard Serial Port Profile (SPP) UUID for thermal POS printers
    private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

    override fun load() {
        super.load()
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
    }

    /**
     * List all paired (bonded) Bluetooth devices on the Android system
     */
    @SuppressLint("MissingPermission")
    @PluginMethod
    fun listPairedDevices(call: PluginCall) {
        val adapter = bluetoothAdapter
        if (adapter == null || !adapter.isEnabled) {
            call.reject("Bluetooth is disabled or not available on this Android device.")
            return
        }

        try {
            val pairedDevices: Set<BluetoothDevice>? = adapter.bondedDevices
            constListDevices(pairedDevices, call)
        } catch (e: Exception) {
            call.reject("Failed to list bonded Bluetooth devices: ${e.localizedMessage}", e)
        }
    }

    @SuppressLint("MissingPermission")
    private fun constListDevices(pairedDevices: Set<BluetoothDevice>?, call: PluginCall) {
        val deviceList = JSArray()
        pairedDevices?.forEach { device ->
            val devObj = JSObject()
            devObj.put("name", device.name ?: "Unknown POS Printer")
            devObj.put("address", device.address)
            deviceList.put(devObj)
        }

        val result = JSObject()
        result.put("devices", deviceList)
        call.resolve(result)
    }

    /**
     * Connect natively to a Bluetooth printer using MAC Address
     */
    @SuppressLint("MissingPermission")
    @PluginMethod
    fun connect(call: PluginCall) {
        val address = call.getString("address")
        if (address.isNullOrEmpty()) {
          call.reject("Printer MAC address parameter is required.")
          return
        }

        val adapter = bluetoothAdapter
        if (adapter == null || !adapter.isEnabled) {
            call.reject("Bluetooth is not enabled.")
            return
        }

        Thread {
            try {
                // Close existing connection if any
                disconnectInternal()

                val device: BluetoothDevice = adapter.getRemoteDevice(address)
                var socket: BluetoothSocket? = null

                try {
                    socket = device.createRfcommSocketToServiceRecord(SPP_UUID)
                    socket.connect()
                } catch (e: Exception) {
                    // Fallback to reflection method if standard RFCOMM connection fails
                    val m = device.javaClass.getMethod("createRfcommSocket", Int::class.javaPrimitiveType)
                    socket = m.invoke(device, 1) as BluetoothSocket
                    socket.connect()
                }

                bluetoothSocket = socket
                outputStream = socket.outputStream
                connectedDeviceName = device.name ?: "Bluetooth Thermal Printer"
                connectedDeviceAddress = address

                val ret = JSObject()
                ret.put("status", "connected")
                ret.put("deviceName", connectedDeviceName)
                ret.put("address", address)
                call.resolve(ret)

            } catch (e: Exception) {
                disconnectInternal()
                call.reject("Failed to connect to Bluetooth printer ($address): ${e.localizedMessage}", e)
            }
        }.start()
    }

    /**
     * Check active Bluetooth printer connection status
     */
    @PluginMethod
    fun isConnected(call: PluginCall) {
        val isConn = bluetoothSocket != null && bluetoothSocket!!.isConnected
        val ret = JSObject()
        ret.put("isConnected", isConn)
        ret.put("deviceName", connectedDeviceName)
        ret.put("address", connectedDeviceAddress)
        call.resolve(ret)
    }

    /**
     * Send raw ESC/POS bytes (Base64 string or Byte array) directly to printer Output Stream
     */
    @PluginMethod
    fun printEscPos(call: PluginCall) {
        val base64Data = call.getString("base64Data")
        val byteArrayInput = call.getArray("bytes")
        val targetAddress = call.getString("address") ?: connectedDeviceAddress

        if (targetAddress.isNullOrEmpty() && (outputStream == null || bluetoothSocket == null || !bluetoothSocket!!.isConnected)) {
            call.reject("Bluetooth printer is not paired or connected (missing MAC address).")
            return
        }

        Thread {
            try {
                val adapter = bluetoothAdapter
                if (adapter == null || !adapter.isEnabled) {
                    call.reject("Bluetooth adapter is disabled or unavailable.")
                    return@Thread
                }

                // Auto-reconnect if socket is closed or disconnected
                if (outputStream == null || bluetoothSocket == null || !bluetoothSocket!!.isConnected) {
                    if (!targetAddress.isNullOrEmpty()) {
                        disconnectInternal()
                        val device: BluetoothDevice = adapter.getRemoteDevice(targetAddress)
                        var socket: BluetoothSocket? = null
                        try {
                            socket = device.createRfcommSocketToServiceRecord(SPP_UUID)
                            socket.connect()
                        } catch (e: Exception) {
                            val m = device.javaClass.getMethod("createRfcommSocket", Int::class.javaPrimitiveType)
                            socket = m.invoke(device, 1) as BluetoothSocket
                            socket.connect()
                        }
                        bluetoothSocket = socket
                        outputStream = socket.outputStream
                        connectedDeviceName = device.name ?: "Bluetooth Thermal Printer"
                        connectedDeviceAddress = targetAddress
                    }
                }

                if (outputStream == null || bluetoothSocket == null || !bluetoothSocket!!.isConnected) {
                    call.reject("Bluetooth printer is not connected.")
                    return@Thread
                }

                val bytes: ByteArray = when {
                    !base64Data.isNullOrEmpty() -> {
                        Base64.decode(base64Data, Base64.DEFAULT)
                    }
                    byteArrayInput != null -> {
                        val list = ByteArray(byteArrayInput.length())
                        for (i in 0 until byteArrayInput.length()) {
                            list[i] = byteArrayInput.getInt(i).toByte()
                        }
                        list
                    }
                    else -> {
                        call.reject("No ESC/POS data provided for printing.")
                        return@Thread
                    }
                }

                outputStream?.write(bytes)
                outputStream?.flush()

                val ret = JSObject()
                ret.put("success", true)
                ret.put("bytesPrinted", bytes.size)
                call.resolve(ret)

            } catch (e: Exception) {
                disconnectInternal()
                call.reject("Error transmitting ESC/POS bytes to printer: ${e.localizedMessage}", e)
            }
        }.start()
    }

    /**
     * Disconnect active Bluetooth socket
     */
    @PluginMethod
    fun disconnect(call: PluginCall) {
        disconnectInternal()
        val ret = JSObject()
        ret.put("status", "disconnected")
        call.resolve(ret)
    }

    private fun disconnectInternal() {
        try {
            outputStream?.close()
        } catch (_: IOException) {}

        try {
            bluetoothSocket?.close()
        } catch (_: IOException) {}

        outputStream = null
        bluetoothSocket = null
        connectedDeviceName = null
        connectedDeviceAddress = null
    }
}
