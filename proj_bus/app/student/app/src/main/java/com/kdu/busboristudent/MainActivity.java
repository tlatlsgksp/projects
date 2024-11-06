package com.kdu.busboristudent;

import static com.kdu.busboristudent.NotifyService.EXTRA_FRAGMENT_TO_OPEN;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NotificationCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;
import androidx.viewpager2.widget.ViewPager2;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.PopupWindow;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.QueryRequest;
import com.amazonaws.services.dynamodbv2.model.QueryResult;
import com.google.android.material.snackbar.Snackbar;
import com.kdu.busbori.R;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import me.relex.circleindicator.CircleIndicator;
import me.relex.circleindicator.CircleIndicator3;

public class MainActivity extends AppCompatActivity {
    private long backBtnTime = 0;
    private CircleIndicator3 indicator;
    private ViewPager2 viewPager2;
    private PagerAdapter viewPager2Adapter;
    private int currentViewPagerPage = 0;
    private String accessKeyId = BuildConfig.AWS_ACCESS_KEY_ID;
    private String secretAccessKey = BuildConfig.AWS_SECRET_ACCESS_KEY;
    private BasicAWSCredentials credentials = new BasicAWSCredentials(accessKeyId, secretAccessKey);
    private AmazonDynamoDBClient client = new AmazonDynamoDBClient(credentials);
    @SuppressLint("MissingInflatedId")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SharedPreferences preferences = getPreferences(Context.MODE_PRIVATE);
        boolean notificationEnabled = preferences.getBoolean("notificationEnabled", true);
        setContentView(R.layout.activity_main);
        if (notificationEnabled) {
            Intent serviceIntent = new Intent(MainActivity.this, NotifyService.class);
            startForegroundService(serviceIntent);
        }
        Button Schedulebutton = findViewById(R.id.button_schedule);
        Button Campusbutton = findViewById(R.id.button_cam);
        Button bus701button = findViewById(R.id.button_701);
        Button bus21button = findViewById(R.id.button_21);
        Button bus733button = findViewById(R.id.button_733);
        ImageButton notify = findViewById(R.id.notify);
        viewPager2Adapter = new PagerAdapter(getSupportFragmentManager(), getLifecycle());
        viewPager2 = findViewById(R.id.pager);
        viewPager2.setAdapter(viewPager2Adapter);
        indicator = findViewById(R.id.indicator);
        indicator.setViewPager(viewPager2);
        updateNotificationIcon();
        if (getIntent().hasExtra(EXTRA_FRAGMENT_TO_OPEN)) {
            String fragmentToOpen = getIntent().getStringExtra(EXTRA_FRAGMENT_TO_OPEN);
            if ("maps_fragment".equals(fragmentToOpen)) {
                FragmentManager fragmentManager = getSupportFragmentManager();
                FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
                Fragment fragment = new Fragment_maps();
                fragmentTransaction.replace(R.id.container, fragment);
                fragmentTransaction.addToBackStack(null);
                fragmentTransaction.commit();
            }
        }
        notify.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FragmentManager fragmentManager = getSupportFragmentManager();
                Fragment fragment = fragmentManager.findFragmentByTag(Fragment_notify.class.getSimpleName());

                if (fragment == null) {
                    fragment = new Fragment_notify();
                    FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
                    fragmentTransaction.replace(R.id.container, fragment, Fragment_notify.class.getSimpleName());
                    fragmentTransaction.addToBackStack(null);
                    fragmentTransaction.commit();
                }
                showNotificationDisabledPopup(v);
            }
        });
        notify.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                vibrate();
                SharedPreferences preferences = getPreferences(Context.MODE_PRIVATE);
                boolean notificationEnabled = preferences.getBoolean("notificationEnabled", true);

                SharedPreferences.Editor editor = preferences.edit();
                editor.putBoolean("notificationEnabled", !notificationEnabled);
                editor.apply();

                updateNotificationIcon();

                if (!notificationEnabled) {
                    Intent serviceIntent = new Intent(MainActivity.this, NotifyService.class);
                    startForegroundService(serviceIntent);
                    showSnackbar("알림이 설정되었습니다.");
                } else {
                    Intent serviceIntent = new Intent(MainActivity.this, NotifyService.class);
                    stopService(serviceIntent);
                    showSnackbar("알림이 해제되었습니다.");
                }

                return true;
            }
        });
        Schedulebutton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FragmentManager fragmentManager = getSupportFragmentManager();
                FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
                Fragment fragment = new Fragment_schedule();
                fragmentTransaction.replace(R.id.container, fragment);
                fragmentTransaction.addToBackStack(null);
                fragmentTransaction.commit();
            }
        });
        Campusbutton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FragmentManager fragmentManager = getSupportFragmentManager();
                FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
                Fragment fragment = new Fragment_maps();
                fragmentTransaction.replace(R.id.container, fragment);
                fragmentTransaction.addToBackStack(null);
                fragmentTransaction.commit();
            }
        });
        bus701button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FragmentManager fragmentManager = getSupportFragmentManager();
                FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
                Fragment fragment = new Yangjumaps_701();
                fragmentTransaction.replace(R.id.container, fragment);
                fragmentTransaction.addToBackStack(null);
                fragmentTransaction.commit();
            }
        });
        bus21button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FragmentManager fragmentManager = getSupportFragmentManager();
                FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
                Fragment fragment = new Yangjumaps_21();
                fragmentTransaction.replace(R.id.container, fragment);
                fragmentTransaction.addToBackStack(null);
                fragmentTransaction.commit();
            }
        });
        bus733button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FragmentManager fragmentManager = getSupportFragmentManager();
                FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
                Fragment fragment = new Yangjumaps_733();
                fragmentTransaction.replace(R.id.container, fragment);
                fragmentTransaction.addToBackStack(null);
                fragmentTransaction.commit();
            }
        });
    }
    private void showSnackbar(String message) {
        View rootView = getWindow().getDecorView().findViewById(android.R.id.content);
        Snackbar snackbar = Snackbar.make(rootView, message, Snackbar.LENGTH_SHORT);
        snackbar.show();
    }
    private void updateNotificationIcon() {
        ImageButton notify = findViewById(R.id.notify);
        SharedPreferences preferences = getPreferences(Context.MODE_PRIVATE);
        boolean notificationEnabled = preferences.getBoolean("notificationEnabled", true);

        if (notificationEnabled) {
            notify.setImageResource(R.drawable.icon_notify_on);
        } else {
            notify.setImageResource(R.drawable.icon_notify_off);
        }
    }
    private void showNotificationDisabledPopup(View anchorView) {
        LayoutInflater inflater = (LayoutInflater) getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        @SuppressLint("InflateParams") View popupView = inflater.inflate(R.layout.popup_notification_disabled, null);

        // PopupWindow 생성
        PopupWindow popupWindow = new PopupWindow(
                popupView,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
        );

        int[] location = new int[2];
        anchorView.getLocationOnScreen(location);

        int offsetX = 120;
        int offsetY = 60;
        popupWindow.showAtLocation(anchorView, Gravity.TOP | Gravity.END, offsetX, location[1] + offsetY);

        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                popupWindow.dismiss();
            }
        }, 1500);
    }
    private void vibrate() {
        Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                VibrationEffect vibrationEffect = VibrationEffect.createOneShot(1000, VibrationEffect.DEFAULT_AMPLITUDE);
                vibrator.vibrate(vibrationEffect);
            } else {
                vibrator.vibrate(1000);
            }
        }
    }
    @Override
    public void onBackPressed() {
        Fragment currentFragment = getSupportFragmentManager().findFragmentById(R.id.container);

        if (currentFragment instanceof Yangjumaps_701) {
            currentViewPagerPage = 0;
            Yangjumaps_701 yangjumaps_701 = (Yangjumaps_701) currentFragment;
            if (yangjumaps_701.isSlidingPanelExpanded()) {
                yangjumaps_701.collapseSlidingPanel();
            } else {
                super.onBackPressed();
                viewPager2.setAdapter(viewPager2Adapter);
                viewPager2.setCurrentItem(currentViewPagerPage);
            }
        } else if (currentFragment instanceof Yangjumaps_733) {
            currentViewPagerPage = 2;
            Yangjumaps_733 yangjumaps_733 = (Yangjumaps_733) currentFragment;
            if (yangjumaps_733.isSlidingPanelExpanded()) {
                yangjumaps_733.collapseSlidingPanel();
            } else {
                super.onBackPressed();
                viewPager2.setAdapter(viewPager2Adapter);
                viewPager2.setCurrentItem(currentViewPagerPage);
            }
        } else if (currentFragment instanceof Yangjumaps_21) {
            currentViewPagerPage = 1;
            Yangjumaps_21 yangjumaps_21 = (Yangjumaps_21) currentFragment;
            if (yangjumaps_21.isSlidingPanelExpanded()) {
                yangjumaps_21.collapseSlidingPanel();
            } else {
                super.onBackPressed();
                viewPager2.setAdapter(viewPager2Adapter);
                viewPager2.setCurrentItem(currentViewPagerPage);
            }
        } else if (currentFragment instanceof Fragment_schedule) {
            super.onBackPressed();
        } else if (currentFragment instanceof Fragment_maps) {
            super.onBackPressed();
        } else if (currentFragment instanceof Schedule_701) {
            super.onBackPressed();
        } else if (currentFragment instanceof Schedule_21) {
            super.onBackPressed();
        } else if (currentFragment instanceof Schedule_733) {
            super.onBackPressed();
        } else if (currentFragment instanceof Schedule_school) {
            super.onBackPressed();
        } else if (currentFragment instanceof Fragment_notify) {
            super.onBackPressed();
        } else {
            AlertDialog.Builder builder = new AlertDialog.Builder(this);
            builder.setTitle("경동셔틀").setMessage("경동셔틀 앱을 종료하시겠습니까?")
                    .setPositiveButton("종료", (dialogInterface, i) -> finish())
                    .setNegativeButton("취소", (dialogInterface, i) -> dialogInterface.dismiss())
                    .create()
                    .show();
        }
    }
}