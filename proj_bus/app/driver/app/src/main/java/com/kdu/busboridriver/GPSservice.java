package com.kdu.busboridriver;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.provider.Settings;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.model.AttributeAction;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.AttributeValueUpdate;
import com.amazonaws.services.dynamodbv2.model.PutItemRequest;
import com.amazonaws.services.dynamodbv2.model.PutItemResult;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.amazonaws.services.dynamodbv2.model.UpdateItemRequest;
import com.amazonaws.services.dynamodbv2.model.UpdateItemResult;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.tasks.OnSuccessListener;
import com.kdu.busbori.R;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.Executor;

public class GPSservice extends Service {
    private FusedLocationProviderClient fusedLocationClient;
    private LocationManager locationManager;
    private LocationListener locationListener;
    private Thread savethread;
    private Thread updatethread;
    private LatLng Campus = new LatLng(37.810158, 127.071145);
    private LatLng Dobong_end = new LatLng(37.689735, 127.045279);
    private String turnYn = "null";
    private String state = "0";
    @Override
    public void onCreate() {
        super.onCreate();
        private String accessKeyId = BuildConfig.AWS_ACCESS_KEY_ID;
        private String secretAccessKey = BuildConfig.AWS_SECRET_ACCESS_KEY;
        private BasicAWSCredentials credentials = new BasicAWSCredentials(accessKeyId, secretAccessKey);
        private AmazonDynamoDBClient client = new AmazonDynamoDBClient(credentials);
        client.setRegion(Region.getRegion(Regions.AP_NORTHEAST_2));
        @SuppressLint("HardwareIds") String deviceid = Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return;
        }
        fusedLocationClient.getLastLocation()
                .addOnSuccessListener(new OnSuccessListener<Location>() {
                    @Override
                    public void onSuccess(Location location) {
                        if (location != null) {
                            saveLocationToDynamoDB(client, deviceid, location);
                        }
                    }
                });

        locationManager = (LocationManager) getSystemService(LOCATION_SERVICE);
        locationListener = new LocationListener() {
            public void onLocationChanged(Location location) {
                updateTimeInDynamoDB(client, deviceid, location);
            }

            @Override
            public void onStatusChanged(String provider, int status, Bundle extras) {
            }

            @Override
            public void onProviderEnabled(String provider) {
            }

            @Override
            public void onProviderDisabled(String provider) {
            }
        };
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (locationManager != null && locationListener != null) {
            if (checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                    && checkSelfPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                locationManager.requestLocationUpdates(
                        LocationManager.GPS_PROVIDER,
                        1000,
                        10,
                        locationListener
                );
            }
        }
        Intent testIntent = new Intent(getApplicationContext(), DriverActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                testIntent,
                PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel("Driver_channel", "실시간 위치 전송 알림",
                    NotificationManager.IMPORTANCE_DEFAULT);

            NotificationManager mNotificationManager = ((NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE));
            mNotificationManager.createNotificationChannel(channel);

            NotificationCompat.Builder notification
                    = new NotificationCompat.Builder(getApplicationContext(), "Driver_channel")
                    .setSmallIcon(R.mipmap.ic_launcher)
                    .setContentTitle("경동셔틀 기사전용")
                    .setContentIntent(pendingIntent)
                    .setContentText("실시간 위치 전송 중");

            mNotificationManager.notify(1, notification.build());
            startForeground(1, notification.build());
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (locationManager != null && locationListener != null) {
            locationManager.removeUpdates(locationListener);
            stopForeground(true);
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
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
    private void saveLocationToDynamoDB(AmazonDynamoDBClient client, String deviceid, Location location) {
        savethread = new Thread(() -> {
            SharedPreferences preferences = getSharedPreferences("MyPreferences", Context.MODE_PRIVATE);
            SharedPreferences preferences2 = getSharedPreferences("MyPreferences_Route", Context.MODE_PRIVATE);
            String destination = preferences.getString("destination", "");
            String type = preferences.getString("type", "");
            String time = preferences.getString("time", "");
            String distance;
            LatLng nowlocation = new LatLng(location.getLatitude(), location.getLongitude());
            String latLngString = preferences2.getString(destination, "");
            LatLng destinationLatLng = parseLatLngFromString(latLngString);
            if (destinationLatLng != null) {
                distance = String.valueOf((int) calculateDistance(destinationLatLng, Campus));
                int busStopCalculatedDistance;
                int busStartcalculatedDistance;
                if (type.equals("등교")) {
                    busStopCalculatedDistance = (int) calculateDistance(nowlocation, Objects.requireNonNull(destinationLatLng));
                    busStartcalculatedDistance = (int) calculateDistance(nowlocation, Campus);
                } else {
                    if (destination.equals("도봉산")) {
                        busStopCalculatedDistance = (int) calculateDistance(nowlocation, Campus);
                        busStartcalculatedDistance = (int) calculateDistance(nowlocation, Objects.requireNonNull(Dobong_end));
                    } else {
                        busStopCalculatedDistance = (int) calculateDistance(nowlocation, Campus);
                        busStartcalculatedDistance = (int) calculateDistance(nowlocation, Objects.requireNonNull(destinationLatLng));
                    }
                }
                if (busStopCalculatedDistance < 100) {
                    turnYn = "Y";
                    state = "1"; // 탑승지 도착
                }
                if (turnYn.equals("Y") && busStopCalculatedDistance > 100){
                    state = "2"; // 탑승지 출발
                }
                if (busStartcalculatedDistance < 100) {
                    turnYn = "N";
                    state = "3"; // 출발지 도착
                }
                if (turnYn.equals("N") && busStartcalculatedDistance > 100){
                    state = "4"; // 출발지 출발
                }
                String finalTurnYn = turnYn;
                PutItemRequest request = new PutItemRequest()
                        .withTableName("Borigps")
                        .withItem(new HashMap<String, AttributeValue>() {{
                            put("deviceid", new AttributeValue(deviceid));
                            put("destination", new AttributeValue(destination));
                            put("type", new AttributeValue(type));
                            put("time", new AttributeValue(time));
                            put("turnYn", new AttributeValue(finalTurnYn));
                            put("distance_now", new AttributeValue(String.valueOf(busStopCalculatedDistance)));
                            put("distance", new AttributeValue(distance));
                            put("latitude", new AttributeValue(String.valueOf(location.getLatitude())));
                            put("longitude", new AttributeValue(String.valueOf(location.getLongitude())));
                            put("Run", new AttributeValue("운행 중"));
                            put("State", new AttributeValue(state));
                        }});
                try {
                    PutItemResult result = client.putItem(request);


                } catch (AmazonServiceException e) {
                    e.printStackTrace();
                    savethread.interrupt();
                    if (savethread.isInterrupted()) {
                        savethread.start();
                    }
                }
            }
        });
        savethread.start();
    }
    private LatLng parseLatLngFromString(String latLngString) {
        if (latLngString != null && !latLngString.isEmpty()) {
            latLngString = latLngString.replace("lat/lng:", "").replace("(", "").replace(")", "").trim();
            String[] latLngArray = latLngString.split(",");
            if (latLngArray.length == 2) {
                double latitude = Double.parseDouble(latLngArray[0].trim());
                double longitude = Double.parseDouble(latLngArray[1].trim());
                return new LatLng(latitude, longitude);
            }
        }
        return null;
    }
    private void updateTimeInDynamoDB(AmazonDynamoDBClient client, String deviceid, Location location) {
        updatethread = new Thread(() -> {
            SharedPreferences preferences = getSharedPreferences("MyPreferences", Context.MODE_PRIVATE);
            SharedPreferences preferences2 = getSharedPreferences("MyPreferences_Route", Context.MODE_PRIVATE);
            String destination = preferences.getString("destination", "");
            String type = preferences.getString("type", "");
            String time = preferences.getString("time", "");
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("deviceid", new AttributeValue(deviceid));
            String distance;
            LatLng nowlocation = new LatLng(location.getLatitude(), location.getLongitude());
            String latLngString = preferences2.getString(destination, "");
            LatLng destinationLatLng = parseLatLngFromString(latLngString);
            if (destinationLatLng != null) {
                distance = String.valueOf((int) calculateDistance(destinationLatLng, Campus));
                int busStopCalculatedDistance;
                int busStartcalculatedDistance;
                if (type.equals("등교")) {
                    busStopCalculatedDistance = (int) calculateDistance(nowlocation, Objects.requireNonNull(destinationLatLng));
                    busStartcalculatedDistance = (int) calculateDistance(nowlocation, Campus);
                } else {
                    if (destination.equals("도봉산")) {
                        busStopCalculatedDistance = (int) calculateDistance(nowlocation, Campus);
                        busStartcalculatedDistance = (int) calculateDistance(nowlocation, Objects.requireNonNull(Dobong_end));
                    } else {
                        busStopCalculatedDistance = (int) calculateDistance(nowlocation, Campus);
                        busStartcalculatedDistance = (int) calculateDistance(nowlocation, Objects.requireNonNull(destinationLatLng));
                    }
                }
                if (busStopCalculatedDistance < 100) {
                    turnYn = "Y";
                    state = "1"; //탑승지 도착
                }
                if (turnYn.equals("Y") && busStopCalculatedDistance > 100){
                    state = "2"; //탑승지 출발
                }
                if (busStartcalculatedDistance < 100) {
                    turnYn = "N";
                    state = "3"; //도착지 도착
                }
                if (turnYn.equals("N") && busStartcalculatedDistance > 100){
                    state = "4"; //도착지 출발
                }
                String finalTurnYn = turnYn;
                Map<String, AttributeValueUpdate> attributeUpdates = new HashMap<>();
                attributeUpdates.put("destination", new AttributeValueUpdate().withAction(AttributeAction.PUT).withValue(new AttributeValue(destination)));
                attributeUpdates.put("type", new AttributeValueUpdate().withAction(AttributeAction.PUT).withValue(new AttributeValue(type)));
                attributeUpdates.put("time", new AttributeValueUpdate().withAction(AttributeAction.PUT).withValue(new AttributeValue(time)));
                attributeUpdates.put("turnYn", new AttributeValueUpdate().withAction(AttributeAction.PUT).withValue(new AttributeValue(finalTurnYn)));
                attributeUpdates.put("distance_now", new AttributeValueUpdate().withAction(AttributeAction.PUT).withValue(new AttributeValue(String.valueOf(busStopCalculatedDistance))));
                attributeUpdates.put("distance", new AttributeValueUpdate().withAction(AttributeAction.PUT).withValue(new AttributeValue(distance)));
                attributeUpdates.put("latitude", new AttributeValueUpdate().withAction(AttributeAction.PUT).withValue(new AttributeValue(String.valueOf(location.getLatitude()))));
                attributeUpdates.put("longitude", new AttributeValueUpdate().withAction(AttributeAction.PUT).withValue(new AttributeValue(String.valueOf(location.getLongitude()))));
                attributeUpdates.put("Run", new AttributeValueUpdate().withAction(AttributeAction.PUT).withValue(new AttributeValue("운행 중")));
                attributeUpdates.put("State", new AttributeValueUpdate().withAction(AttributeAction.PUT).withValue(new AttributeValue(state)));

                UpdateItemRequest request = new UpdateItemRequest()
                        .withTableName("Borigps")
                        .withKey(key)
                        .withAttributeUpdates(attributeUpdates);

                try {
                    UpdateItemResult result = client.updateItem(request);
                } catch (AmazonServiceException e) {
                    e.printStackTrace();
                    updatethread.interrupt();
                    if (updatethread.isInterrupted()) {
                        updatethread.start();
                    }
                }
            }
        });
        updatethread.start();
    }
}