package com.trakz.pos

import android.os.Bundle
import com.getcapacitor.BridgeActivity
import com.trakz.pos.plugins.BluetoothPrinterPlugin

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        registerPlugin(BluetoothPrinterPlugin::class.java)
    }
}
