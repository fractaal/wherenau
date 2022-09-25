package org.council.wherenau;

import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);

    View decorView = this.getWindow().getDecorView();
    int uiOptions = decorView.getSystemUiVisibility();
    uiOptions = uiOptions | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN;
    decorView.setSystemUiVisibility(uiOptions);
    this.getWindow().setStatusBarColor(Color.TRANSPARENT);

    Log.d("Debug", "Main activity run!");
  }
}
