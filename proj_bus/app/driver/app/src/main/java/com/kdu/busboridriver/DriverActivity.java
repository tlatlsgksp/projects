package com.kdu.busboridriver;

import static android.service.controls.ControlsProviderService.TAG;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentSender;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.os.PersistableBundle;
import android.provider.Settings;
import android.util.Log;
import android.util.TypedValue;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.model.AttributeAction;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.AttributeValueUpdate;
import com.amazonaws.services.dynamodbv2.model.GetItemRequest;
import com.amazonaws.services.dynamodbv2.model.GetItemResult;
import com.amazonaws.services.dynamodbv2.model.PutItemRequest;
import com.amazonaws.services.dynamodbv2.model.PutItemResult;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.amazonaws.services.dynamodbv2.model.UpdateItemRequest;
import com.amazonaws.services.dynamodbv2.model.UpdateItemResult;
import com.google.android.gms.common.api.ResolvableApiException;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationSettingsRequest;
import com.google.android.gms.location.LocationSettingsResponse;
import com.google.android.gms.location.SettingsClient;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.kdu.busbori.R;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;

public class DriverActivity extends AppCompatActivity {
    private ToggleButton toggleButton;
    private boolean isServiceRunning = false;
    private SharedPreferences sharedPreferences;
    public String time;
    public String Run;
    private Thread timethread;
    private Thread runthread;
    private FrameLayout access;
    private String userName;
    private String deviceid;
    private String savedTime;
    private Thread savethread;
    private Thread Resavethread;
    private Thread buttonthread;
    private List<BusButton> busButtons = new ArrayList<>();
    private LinearLayout MainLinearLayout;
    private int buttonsInCurrentRow;
    private int maxButtonsPerRow;
    private Thread routethread;
    private Map<String, LatLng> stationCoordinates = new HashMap<>();
    private LatLng Campus = new LatLng(37.810158, 127.071145);
    private String accessKeyId = BuildConfig.AWS_ACCESS_KEY_ID;
    private String secretAccessKey = BuildConfig.AWS_SECRET_ACCESS_KEY;
    private BasicAWSCredentials credentials = new BasicAWSCredentials(accessKeyId, secretAccessKey);
    private AmazonDynamoDBClient client = new AmazonDynamoDBClient(credentials);
    @SuppressLint({"HardwareIds", "SetTextI18n"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        client.setRegion(Region.getRegion(Regions.AP_NORTHEAST_2));
        setContentView(R.layout.activity_driver);
        access = findViewById(R.id.access);
        client.setRegion(Region.getRegion(Regions.AP_NORTHEAST_2));
        deviceid = Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
        sharedPreferences = getSharedPreferences("MyPrefs", MODE_PRIVATE);
        SharedPreferences preferences = getSharedPreferences("MyPreferences", Context.MODE_PRIVATE);
        SharedPreferences namepreferences = getSharedPreferences("userName", MODE_PRIVATE);
        userName = namepreferences.getString("userName", "");
        savedTime = preferences.getString("choosetime_text", "");
        TextView chooseTime = findViewById(R.id.choosetime);
        chooseTime.setText(savedTime);
        buttonthread = new Thread(() -> {
            ScanRequest request = new ScanRequest()
                    .withTableName("Busbutton");
            ScanResult result = client.scan(request);
            List<Map<String, AttributeValue>> items = result.getItems();

            for (Map<String, AttributeValue> item : items) {
                String assort = item.get("assort") != null ? item.get("assort").getS() : null;
                String buttonText = item.get("buttonText") != null ? item.get("buttonText").getS() : null;
                String destination = item.get("destination") != null ? item.get("destination").getS() : null;
                String time = item.get("time") != null ? item.get("time").getS() : null;
                String type = item.get("type") != null ? item.get("type").getS() : null;

                if (assort != null && buttonText != null && destination != null && time != null && type != null) {
                    BusButton busButton = new BusButton(assort, buttonText, destination, time, type);
                    busButtons.add(busButton);
                }
            }
            busButtons.sort(new Comparator<BusButton>() {
                @Override
                public int compare(BusButton button1, BusButton button2) {
                    return button1.getAssort().compareTo(button2.getAssort());
                }
            });

            runOnUiThread(() -> {
                String prevGroupHeaderText = null;
                MainLinearLayout = findViewById(R.id.linear);
                LinearLayout ButtonLinearLayout = null;
                LinearLayout PaddingLinearLayout = null;
                LinearLayout childPaddingLinearLayout = null;
                int maxButtonsPerRow;
                int buttonsInCurrentRow = 0;

                for (BusButton button : busButtons) {
                    String groupHeaderText = button.getAssort().replaceAll("[0-9]", "");

                    if (!groupHeaderText.equals(prevGroupHeaderText)) {
                        prevGroupHeaderText = groupHeaderText;
                        buttonsInCurrentRow = 0;

                        TextView headerText = new TextView(this);
                        headerText.setText(groupHeaderText);
                        headerText.setTextColor(Color.parseColor("#26383A"));
                        headerText.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
                        headerText.setTypeface(headerText.getTypeface(), Typeface.BOLD);
                        headerText.setPadding(0, 10, 0, 0);

                        MainLinearLayout.addView(headerText);

                        PaddingLinearLayout = new LinearLayout(this);
                        PaddingLinearLayout.setOrientation(LinearLayout.VERTICAL);
                        PaddingLinearLayout.setBackgroundResource(R.drawable.rectangle);
                        PaddingLinearLayout.setPadding(15, 10, 15, 15);
                        MainLinearLayout.addView(PaddingLinearLayout);
                    }

                    LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1);

                    int numberOfButtons = Integer.parseInt(button.getButtonText());

                    for (int i = 1; i <= numberOfButtons; i++) {
                        Button newButton = new Button(this);
                        String buttonText;

                        if (numberOfButtons == 1) {
                            buttonText = button.getTime();
                            maxButtonsPerRow = 3;
                        } else {
                            buttonText = i + "호차";
                            maxButtonsPerRow = numberOfButtons;
                        }

                        newButton.setText(buttonText);
                        newButton.setBackgroundTintList(ColorStateList.valueOf(Color.parseColor("#FFE3E9FF")));

                        newButton.setOnClickListener(view -> {
                            String getdestination = button.getDestination();
                            String gettime;
                            String gettype = button.getType();

                            SharedPreferences timepreferences = getSharedPreferences("MyPreferences", Context.MODE_PRIVATE);
                            @SuppressLint("CommitPrefEdits") SharedPreferences.Editor editor = timepreferences.edit();
                            editor.putString("destination", getdestination);
                            editor.putString("type", gettype);

                            if (numberOfButtons == 1) {
                                gettime = button.getTime();
                            } else {
                                gettime = button.getTime() + " " + (String) newButton.getText();
                            }
                            time = getdestination + "[" + gettype + "] " + gettime;
                            chooseTime.setText(time);
                            editor.putString("time", gettime);
                            editor.putString("choosetime_text", time);
                            editor.apply();
                            savedTime = preferences.getString("choosetime_text", "");
                            updateTimeInDynamoDB(client, deviceid, getdestination, gettype, gettime);
                            if (isServiceRunning) {
                                stopService();
                                startService();
                            }
                        });

                        if (buttonsInCurrentRow == 0) {
                            ButtonLinearLayout = new LinearLayout(this);
                            ButtonLinearLayout.setOrientation(LinearLayout.HORIZONTAL);
                        }

                        ButtonLinearLayout.addView(newButton, layoutParams);
                        buttonsInCurrentRow++;
                        childPaddingLinearLayout = new LinearLayout(this);
                        childPaddingLinearLayout.setOrientation(LinearLayout.VERTICAL);

                        if (buttonsInCurrentRow == maxButtonsPerRow || (numberOfButtons == 1 && buttonsInCurrentRow == 1)) {
                            if (numberOfButtons != 1) {
                                TextView timeText = new TextView(this);
                                timeText.setTypeface(timeText.getTypeface(), Typeface.BOLD);
                                timeText.setText("  "+button.getTime());
                                childPaddingLinearLayout.addView(timeText);
                                childPaddingLinearLayout.addView(ButtonLinearLayout);
                                View separator = new View(this);
                                LinearLayout.LayoutParams separatorParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, (int) (1 * getResources().getDisplayMetrics().density + 0.5f));
                                separator.setBackgroundColor(Color.parseColor("#99CCFF"));
                                childPaddingLinearLayout.addView(separator, separatorParams);
                            } else {
                                childPaddingLinearLayout.addView(ButtonLinearLayout);
                                View separator = new View(this);
                                LinearLayout.LayoutParams separatorParams = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, (int) (1 * getResources().getDisplayMetrics().density + 0.5f));
                                separator.setBackgroundColor(Color.parseColor("#99CCFF"));
                                childPaddingLinearLayout.addView(separator, separatorParams);
                            }
                            PaddingLinearLayout.addView(childPaddingLinearLayout);
                            buttonsInCurrentRow = 0;
                        }
                    }
                }
            });
        });
        buttonthread.start();
        if (!isUserNameSet()) {
            showNameInputDialog();
        } else {
            CompletableFuture.supplyAsync(() -> checkAccessPermission(client))
                    .thenAccept(hasAccess -> {
                        if (hasAccess) {
                            runOnUiThread(() -> access.setVisibility(View.GONE));
                        } else {
                            toggleButton.setChecked(false);
                            stopService();
                            saveDataInDynamoDB();
                        }
                    });
        }

        ImageButton rename = findViewById(R.id.rename);
        rename.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                ReshowNameInputDialog();
            }
        });

        toggleButton = findViewById(R.id.toggle_gps);
        toggleButton.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (isChecked) {
                    if (!savedTime.isEmpty()) {
                        startService();
                        Run = "운행 중";
                        updateRunInDynamoDB(client, deviceid, Run);
                    } else {
                        toggleButton.setChecked(false);
                        AlertDialog.Builder builder = new AlertDialog.Builder(DriverActivity.this);
                        builder.setMessage("운행 시간을 선택해주세요.")
                                .setNegativeButton("확인", (dialogInterface, i) -> dialogInterface.dismiss())
                                .create()
                                .show();
                    }
                } else {
                    stopService();
                    Run = "운행 정보 없음";
                    updateRunInDynamoDB(client, deviceid, Run);
                }
            }
        });
    }
    private void BusRoute() {
        client.setRegion(Region.getRegion(Regions.AP_NORTHEAST_2));
        SharedPreferences preferences = getSharedPreferences("MyPreferences_Route", Context.MODE_PRIVATE);
        routethread = new Thread(() -> {
            ScanRequest request = new ScanRequest()
                    .withTableName("BusRoute");
            ScanResult result = client.scan(request);
            List<Map<String, AttributeValue>> items = result.getItems();

            for (Map<String, AttributeValue> item : items) {
                String stationName = item.get("stationName") != null ? item.get("stationName").getS() : null;
                String latitudeStr = item.get("latitude") != null ? item.get("latitude").getS() : null;
                String longitudeStr = item.get("longitude") != null ? item.get("longitude").getS() : null;

                if (stationName != null && latitudeStr != null && longitudeStr != null) {
                    double latitude = Double.parseDouble(latitudeStr);
                    double longitude = Double.parseDouble(longitudeStr);
                    LatLng stationLocation = new LatLng(latitude, longitude);

                    stationCoordinates.put(stationName, stationLocation);
                    @SuppressLint("CommitPrefEdits") SharedPreferences.Editor editor = preferences.edit();
                    editor.putString(stationName, String.valueOf(stationLocation));
                    editor.apply();
                }
            }
        });
        routethread.start();
    }
    private void saveDataInDynamoDB(){
        client.setRegion(Region.getRegion(Regions.AP_NORTHEAST_2));
        savethread = new Thread(() -> {
            PutItemRequest request = new PutItemRequest()
                    .withTableName("Access")
                    .withItem(new HashMap<String, AttributeValue>() {{
                        put("deviceid", new AttributeValue(deviceid));
                        put("name", new AttributeValue(userName));
                        put("Access", new AttributeValue("불가"));
                    }});

            try {
                PutItemResult result = client.putItem(request);
            } catch (AmazonServiceException e) {
                e.printStackTrace();
                if (savethread.isInterrupted()) {
                    savethread.start();
                }
            } finally {
                savethread.interrupt();
            }
        });
        savethread.start();
    }
    private void ResaveDataInDynamoDB(){
        client.setRegion(Region.getRegion(Regions.AP_NORTHEAST_2));
        Resavethread = new Thread(() -> {
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("deviceid", new AttributeValue(deviceid));

            Map<String, AttributeValueUpdate> attributeUpdates = new HashMap<>();
            attributeUpdates.put(
                    "name",
                    new AttributeValueUpdate()
                            .withAction(AttributeAction.PUT)
                            .withValue(new AttributeValue(userName))
            );

            UpdateItemRequest request = new UpdateItemRequest()
                    .withTableName("Access")
                    .withKey(key)
                    .withAttributeUpdates(attributeUpdates);

            try {
                UpdateItemResult result = client.updateItem(request);
            } catch (AmazonServiceException e) {
                e.printStackTrace();
                if (Resavethread.isInterrupted()) {
                    Resavethread.start();
                }
            } finally {
                Resavethread.interrupt();
            }
        });
        Resavethread.start();
    }

    private void updateTimeInDynamoDB(AmazonDynamoDBClient client, String deviceid, String destination, String type, String time) {
        String distance;
        LatLng destinationLatLng = stationCoordinates.get(destination);
        distance = String.valueOf((int) calculateDistance(Objects.requireNonNull(destinationLatLng), Campus));
        timethread = new Thread(() -> {
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("deviceid", new AttributeValue(deviceid));

            Map<String, AttributeValueUpdate> attributeUpdates = new HashMap<>();
            attributeUpdates.put(
                    "destination",
                    new AttributeValueUpdate()
                            .withAction(AttributeAction.PUT)
                            .withValue(new AttributeValue(destination))
            );
            attributeUpdates.put(
                    "type",
                    new AttributeValueUpdate()
                            .withAction(AttributeAction.PUT)
                            .withValue(new AttributeValue(type))
            );
            attributeUpdates.put(
                    "time",
                    new AttributeValueUpdate()
                            .withAction(AttributeAction.PUT)
                            .withValue(new AttributeValue(time))
            );
            attributeUpdates.put(
                    "distance",
                    new AttributeValueUpdate()
                            .withAction(AttributeAction.PUT)
                            .withValue(new AttributeValue(distance))
            );

            UpdateItemRequest request = new UpdateItemRequest()
                    .withTableName("Borigps")
                    .withKey(key)
                    .withAttributeUpdates(attributeUpdates);

            try {
                UpdateItemResult result = client.updateItem(request);
            } catch (AmazonServiceException e) {
                e.printStackTrace();
                if (timethread.isInterrupted()) {
                    timethread.start();
                }
            }
        });
        timethread.start();
    }
    private double calculateDistance(LatLng point1, LatLng point2) {
        double earthRadius = 6371000;

        double lat1 = Math.toRadians(point1.latitude);
        double lon1 = Math.toRadians(point1.longitude);
        double lat2 = Math.toRadians(point2.latitude);
        double lon2 = Math.toRadians(point2.longitude);

        double dlat = lat2 - lat1;
        double dlon = lon2 - lon1;
        double a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
                Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return earthRadius * c;
    }
    private void updateRunInDynamoDB(AmazonDynamoDBClient client, String deviceid, String Run) {
        runthread = new Thread(() -> {
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("deviceid", new AttributeValue(deviceid));

            Map<String, AttributeValueUpdate> attributeUpdates = new HashMap<>();
            attributeUpdates.put(
                    "Run",
                    new AttributeValueUpdate()
                            .withAction(AttributeAction.PUT)
                            .withValue(new AttributeValue(Run))
            );

            UpdateItemRequest request = new UpdateItemRequest()
                    .withTableName("Borigps")
                    .withKey(key)
                    .withAttributeUpdates(attributeUpdates);

            try {
                UpdateItemResult result = client.updateItem(request);
            } catch (AmazonServiceException e) {
                e.printStackTrace();
                if (runthread.isInterrupted()) {
                    runthread.start();
                }
            }
        });
        runthread.start();
    }

    @Override
    protected void onStart() {
        super.onStart();
        BusRoute();
        isServiceRunning = sharedPreferences.getBoolean("serviceRunning", false);
        toggleButton.setChecked(isServiceRunning);
    }

    private void startService() {
        if (checkPermission()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                if (checkBackgroundPermission()) {
                    // GPS 활성화 여부를 확인하고 활성화되어 있을 때만 서비스 시작
                    gpsrequest();
                } else {
                    toggleButton.setChecked(false);
                    requestBackgroundPermission();
                }
            } else {
                // GPS 활성화 여부를 확인하고 활성화되어 있을 때만 서비스 시작
                gpsrequest();
            }
        } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                requestPermission();
                toggleButton.setChecked(false);
            }
        }
    }

    private boolean gpsrequest() {
        LocationRequest locationRequest = LocationRequest.create()
                .setInterval(10000)
                .setFastestInterval(5000)
                .setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);

        LocationSettingsRequest.Builder builder = new LocationSettingsRequest.Builder()
                .addLocationRequest(locationRequest);

        SettingsClient client = LocationServices.getSettingsClient(this);
        Task<LocationSettingsResponse> task = client.checkLocationSettings(builder.build());

        task.addOnSuccessListener(new OnSuccessListener<LocationSettingsResponse>() {
            @Override
            public void onSuccess(LocationSettingsResponse locationSettingsResponse) {
                Intent serviceIntent = new Intent(DriverActivity.this, GPSservice.class);
                startForegroundService(serviceIntent);
                isServiceRunning = true;
                SharedPreferences.Editor editor = sharedPreferences.edit();
                editor.putBoolean("serviceRunning", isServiceRunning);
                editor.apply();
            }
        });

        task.addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(Exception e) {
                toggleButton.setChecked(false);
                if (e instanceof ResolvableApiException) {
                    Log.d(TAG, "OnFailure");
                    try {
                        ((ResolvableApiException) e).startResolutionForResult(
                                DriverActivity.this,
                                100
                        );
                    } catch (IntentSender.SendIntentException sendEx) {
                        Log.d(TAG, sendEx.getMessage().toString());
                    }
                }
            }
        });
        return false;
    }

    private void stopService() {
        Intent serviceIntent = new Intent(DriverActivity.this, GPSservice.class);
        stopService(serviceIntent);

        isServiceRunning = false;
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putBoolean("serviceRunning", isServiceRunning);
        editor.apply();
    }

    private boolean checkBackgroundPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            int backgroundPermissionCheck = ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_BACKGROUND_LOCATION);
            return backgroundPermissionCheck == PackageManager.PERMISSION_GRANTED;
        }
        return true;
    }

    @RequiresApi(api = Build.VERSION_CODES.Q)
    private void requestBackgroundPermission() {
        ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.ACCESS_BACKGROUND_LOCATION}, 2);
        Toast.makeText(this, "위치 항상 허용, 정확한 위치 사용을 체크해 주시길 바랍니다.", Toast.LENGTH_LONG).show();
    }

    private boolean checkPermission() {
        int permissionCheck = ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION);
        if (permissionCheck == PackageManager.PERMISSION_GRANTED) {
            return true;
        } else {
            return false;
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.Q)
    private void requestPermission() {
        ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.ACCESS_COARSE_LOCATION}, 1);
    }
    private boolean isUserNameSet() {
        SharedPreferences preferences = getSharedPreferences("userName", MODE_PRIVATE);
        userName = preferences.getString("userName", "");
        return !userName.isEmpty();
    }

    private void showNameInputDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("사용자 이름 입력");

        final EditText input = new EditText(this);
        builder.setView(input);

        builder.setPositiveButton("확인", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                userName = input.getText().toString();
                SharedPreferences preferences = getSharedPreferences("userName", MODE_PRIVATE);
                SharedPreferences.Editor editor = preferences.edit();
                editor.putString("userName", userName);
                editor.apply();
            }
        });
        builder.setCancelable(false);
        builder.create().show();
    }

    private void ReshowNameInputDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("사용자 이름 변경");

        final EditText input = new EditText(this);
        input.setText(userName);
        builder.setView(input);

        builder.setPositiveButton("변경", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                userName = input.getText().toString();
                SharedPreferences preferences = getSharedPreferences("userName", MODE_PRIVATE);
                SharedPreferences.Editor editor = preferences.edit();
                editor.putString("userName", userName);
                editor.apply();
                ResaveDataInDynamoDB();
            }
        });
        builder.setNegativeButton("취소", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
            }
        });
        builder.setCancelable(false);
        builder.create().show();
    }
    private boolean checkAccessPermission(AmazonDynamoDBClient client) {
        try {
            GetItemRequest getItemRequest = new GetItemRequest()
                    .withTableName("Access")
                    .addKeyEntry("deviceid", new AttributeValue().withS(deviceid));

            GetItemResult getItemResult = client.getItem(getItemRequest);
            Map<String, AttributeValue> item = getItemResult.getItem();

            if (item != null) {
                AttributeValue accessValue = item.get("Access");
                if (accessValue != null && accessValue.getS().equals("허용")) {
                    return true;
                }
            }
        } catch (AmazonServiceException e) {
            e.printStackTrace();
        }
        return false;
    }
    @Override
    public void onBackPressed() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("경동셔틀").setMessage("경동셔틀 앱을 종료하시겠습니까?")
                .setPositiveButton("종료", (dialogInterface, i) -> finish())
                .setNegativeButton("취소", (dialogInterface, i) -> dialogInterface.dismiss())
                .create()
                .show();

    }
}