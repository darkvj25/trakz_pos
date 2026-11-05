package com.trakz.pos.plugins

import android.Manifest
import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.bluetooth.BluetoothSocket
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.util.Base64
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.annotation.Permission
import java.io.IOException
import java.io.OutputStream
import java.util.UUID

@CapacitorPlugin(
    name = "BluetoothPrinter",
    permissions = [
        Permission(
            alias = "bluetooth",
            strings = [
                Manifest.permission.BLUETOOTH_CONNECT,
                Manifest.permission.BLUETOOTH_SCAN
            ]
        )
    ]
)
class BluetoothPrinterPlugin : Plugin() {

    private var bluetoothAdapter: BluetoothAdapter? = null
    private var bluetoothSocket: BluetoothSocket? = null
    private var outputStream: OutputStream? = null
    private var connectedDeviceName: String? = null
    private var connectedDeviceAddress: String? = null

    // Standard Serial Port Profile (SPP) UUID for Bluetooth 2.0 / Classic thermal POS printers
    private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

    override fun load() {
        super.load()
        getAdapter()
    }

    private fun getAdapter(): BluetoothAdapter? {
        if (bluetoothAdapter == null) {
            val manager = context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
            bluetoothAdapter = manager?.adapter ?: BluetoothAdapter.getDefaultAdapter()
        }
        return bluetoothAdapter
    }

    /**
     * List all paired (bonded) Bluetooth 2.0 / Classic devices on the Android system
     */
    @SuppressLint("MissingPermission")
    @PluginMethod
    fun listPairedDevices(call: PluginCall) {
        val adapter = getAdapter()
        if (adapter == null) {
            call.reject("Bluetooth hardware is not available on this Android device.")
            return
        }
        if (!adapter.isEnabled) {
            call.reject("Bluetooth is disabled. Please enable Bluetooth in Android settings.")
            return
        }

        try {
            val pairedDevices: Set<BluetoothDevice>? = adapter.bondedDevices
            constListDevices(pairedDevices, call)
        } catch (e: SecurityException) {
            call.reject("Bluetooth permission denied on Android 12+. Please grant Bluetooth permission in App Settings.", e)
        } catch (e: Exception) {
            call.reject("Failed to list bonded Bluetooth devices: ${e.localizedMessage}", e)
        }
    }

    @SuppressLint("MissingPermission")
    private fun constListDevices(pairedDevices: Set<BluetoothDevice>?, call: PluginCall) {
        val deviceList = JSArray()
        pairedDevices?.forEach { device ->
            val devObj = JSObject()
            devObj.put("name", device.name ?: "Unknown POS Thermal Printer")
            devObj.put("address", device.address)
            deviceList.put(devObj)
        }

        val result = JSObject()
        result.put("devices", deviceList)
        call.resolve(result)
    }

    /**
     * Open system Bluetooth Settings so user can pair Bluetooth 2.0 Classic thermal printers
     */
    @PluginMethod
    fun openBluetoothSettings(call: PluginCall) {
        try {
            val intent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            context.startActivity(intent)
            val ret = JSObject()
            ret.put("success", true)
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("Failed to open Bluetooth Settings: ${e.localizedMessage}", e)
        }
    }

    /**
     * Connect natively to a Bluetooth 2.0 / Classic printer via RFCOMM SPP socket
     */
    @SuppressLint("MissingPermission")
    @PluginMethod
    fun connect(call: PluginCall) {
        val address = call.getString("address")
        if (address.isNullOrEmpty()) {
            call.reject("Printer MAC address parameter is required.")
            return
        }

        val adapter = getAdapter()
        if (adapter == null || !adapter.isEnabled) {
            call.reject("Bluetooth adapter is disabled or unavailable.")
            return
        }

        Thread {
            try {
                // Close existing socket connection if any
                disconnectInternal()

                val device: BluetoothDevice = adapter.getRemoteDevice(address)
                var socket: BluetoothSocket? = createSocketWithFallbacks(device)

                if (socket == null) {
                    call.reject("Could not create RFCOMM Bluetooth 2.0 socket for device $address.")
                    return@Thread
                }

                socket.connect()

                bluetoothSocket = socket
                outputStream = socket.outputStream
                connectedDeviceName = device.name ?: "Bluetooth 2.0 Thermal Printer"
                connectedDeviceAddress = address

                val ret = JSObject()
                ret.put("status", "connected")
                ret.put("deviceName", connectedDeviceName)
                ret.put("address", address)
                call.resolve(ret)

            } catch (e: Exception) {
                disconnectInternal()
                call.reject("Failed to connect to Bluetooth 2.0 printer ($address): ${e.localizedMessage}", e)
            }
        }.start()
    }

    @SuppressLint("MissingPermission")
    private fun createSocketWithFallbacks(device: BluetoothDevice): BluetoothSocket? {
        // Attempt 1: Standard RFCOMM SPP socket
        try {
            return device.createRfcommSocketToServiceRecord(SPP_UUID)
        } catch (_: Exception) {}

        // Attempt 2: Insecure RFCOMM SPP socket
        try {
            return device.createInsecureRfcommSocketToServiceRecord(SPP_UUID)
        } catch (_: Exception) {}

        // Attempt 3: Reflection on channel 1 (legacy Bluetooth 2.0 Classic devices)
        try {
            val method = device.javaClass.getMethod("createRfcommSocket", Int::class.javaPrimitiveType)
            return method.invoke(device, 1) as BluetoothSocket
        } catch (_: Exception) {}

        return null
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
     * Send raw ESC/POS bytes directly to Bluetooth 2.0 Classic printer Output Stream with chunking
     */
    @PluginMethod
    fun printEscPos(call: PluginCall) {
        val base64Data = call.getString("base64Data")
        val byteArrayInput = call.getArray("bytes")
        val targetAddress = call.getString("address") ?: connectedDeviceAddress

        if (targetAddress.isNullOrEmpty() && (outputStream == null || bluetoothSocket == null || !bluetoothSocket!!.isConnected)) {
            call.reject("Bluetooth 2.0 printer is not connected (missing MAC address).")
            return
        }

        Thread {
            try {
                val adapter = getAdapter()
                if (adapter == null || !adapter.isEnabled) {
                    call.reject("Bluetooth adapter is disabled or unavailable.")
                    return@Thread
                }

                // Auto-reconnect if socket is closed or disconnected
                if (outputStream == null || bluetoothSocket == null || !bluetoothSocket!!.isConnected) {
                    if (!targetAddress.isNullOrEmpty()) {
                        disconnectInternal()
                        val device: BluetoothDevice = adapter.getRemoteDevice(targetAddress)
                        val socket = createSocketWithFallbacks(device)
                        socket?.connect()

                        if (socket != null && socket.isConnected) {
                            bluetoothSocket = socket
                            outputStream = socket.outputStream
                            connectedDeviceName = device.name ?: "Bluetooth 2.0 Thermal Printer"
                            connectedDeviceAddress = targetAddress
                        }
                    }
                }

                val currentStream = outputStream
                val currentSocket = bluetoothSocket
                if (currentStream == null || currentSocket == null || !currentSocket.isConnected) {
                    call.reject("Bluetooth 2.0 printer is disconnected. Please re-connect printer.")
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

                // Stream in 64-byte chunks with 15ms delay to prevent BT 2.0 buffer overflow on mini thermal printers
                val chunkSize = 64
                var offset = 0
                while (offset < bytes.size) {
                    val count = Math.min(chunkSize, bytes.size - offset)
                    currentStream.write(bytes, offset, count)
                    currentStream.flush()
                    offset += count
                    if (offset < bytes.size) {
                        try {
                            Thread.sleep(15)
                        } catch (_: InterruptedException) {}
                    }
                }

                val ret = JSObject()
                ret.put("success", true)
                ret.put("bytesPrinted", bytes.size)
                call.resolve(ret)

            } catch (e: Exception) {
                disconnectInternal()
                call.reject("Error transmitting ESC/POS bytes to Bluetooth 2.0 printer: ${e.localizedMessage}", e)
            }
        }.start()
    }

    /**
     * Disconnect active Bluetooth 2.0 socket
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
