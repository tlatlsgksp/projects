package com.kdu.busboristudent;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.SeekBar;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.ScanRequest;
import com.amazonaws.services.dynamodbv2.model.ScanResult;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.BitmapDescriptorFactory;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.material.tabs.TabItem;
import com.google.android.material.tabs.TabLayout;
import com.kdu.busbori.R;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class Fragment_maps extends Fragment {
    private GoogleMap googleMap;
    private LatLng Dobong = new LatLng(37.687332, 127.043672);
    private LatLng Yangju = new LatLng(37.773208, 127.045193);
    private LatLng Deokhyeon = new LatLng(37.798859, 127.081819);
    private LatLng Campus = new LatLng(37.810158, 127.071145);
    private LatLng Whole = new LatLng(37.757432, 127.055045);
    private Map<String, Marker> markers = new HashMap<>();
    private Map<String, String> deviceIdToTimeMap = new HashMap<>();
    private Map<String, String> deviceIdToRunMap = new HashMap<>();
    private String deviceid;
    private String destination;
    private String type;
    private String time;
    private String turnYn;
    private String Run;
    private String distance;
    private String distance_now;
    private LatLng latLng;
    private Thread datathread;
    private Thread routethread;
    boolean isrunning = true;
    private RecyclerView recyclerView;
    private School_Adapter adapter;
    private List<School_DataItem> School_dataList = new ArrayList<>();
    private String accessKeyId = BuildConfig.AWS_ACCESS_KEY_ID;
    private String secretAccessKey = BuildConfig.AWS_SECRET_ACCESS_KEY;
    private BasicAWSCredentials credentials = new BasicAWSCredentials(accessKeyId, secretAccessKey);
    private AmazonDynamoDBClient client = new AmazonDynamoDBClient(credentials);
    private int selectedItem = -1;
    private Map<String, LatLng> stationCoordinates = new HashMap<>();
    private FrameLayout progressBar;
    boolean ischeked = false;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_maps, container, false);
        SupportMapFragment mapFragment =
                (SupportMapFragment) getChildFragmentManager().findFragmentById(R.id.map);
        progressBar = view.findViewById(R.id.progressBar_maps);
        progressBar.setVisibility(View.VISIBLE);
        recyclerView = view.findViewById(R.id.RunList);
        recyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
        if (adapter == null) {
            adapter = new School_Adapter(School_dataList);
        }
        recyclerView.setAdapter(adapter);
        TabLayout tabs = view.findViewById(R.id.schooltab);

        for (Map.Entry<String, LatLng> entry : stationCoordinates.entrySet()) {
            String stationName = entry.getKey();

            TabLayout.Tab tab = tabs.newTab();
            tab.setText(stationName);
            tabs.addTab(tab);
            ischeked = true;
        }

        if (ischeked) {
            if (mapFragment != null) {
                mapFragment.getMapAsync(new OnMapReadyCallback() {
                    @Override
                    public void onMapReady(GoogleMap map) {
                        googleMap = map;
                        for (Map.Entry<String, LatLng> entry : stationCoordinates.entrySet()) {
                            String stationName = entry.getKey();
                            LatLng stationLocation = entry.getValue();

                            MarkerOptions markerOptions = new MarkerOptions()
                                    .position(stationLocation)
                                    .icon(BitmapDescriptorFactory.fromResource(R.drawable.busstationicon_50))
                                    .title(stationName);
                            googleMap.addMarker(markerOptions);
                        }

                        MarkerOptions WholeMarkerOptions = new MarkerOptions();
                        WholeMarkerOptions.position(Whole);

                        moveCameraToLocation(Whole, 12);
                    }
                });
            }
        }
        tabs.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                String selectedTabText = tab.getText().toString();
                LatLng selectedLocation = stationCoordinates.get(selectedTabText);

                if (selectedLocation != null) {
                    googleMap.animateCamera(CameraUpdateFactory.newLatLngZoom(selectedLocation, 16), 250, null);
                }
                if (selectedTabText.equals("전체")){
                    googleMap.animateCamera(CameraUpdateFactory.newLatLngZoom(Whole, 12), 250, null);
                }
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {

            }

            @Override
            public void onTabReselected(TabLayout.Tab tab) {
                String selectedTabText = tab.getText().toString();
                LatLng selectedLocation = stationCoordinates.get(selectedTabText);

                if (selectedLocation != null) {
                    googleMap.animateCamera(CameraUpdateFactory.newLatLngZoom(selectedLocation, 16), 250, null);
                }
                if (selectedTabText.equals("전체")){
                    googleMap.animateCamera(CameraUpdateFactory.newLatLngZoom(Whole, 12), 250, null);
                }
            }
        });

        Button schedule_school = view.findViewById(R.id.schedule_school);
        schedule_school.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                FragmentManager fragmentManager = getParentFragmentManager();
                FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
                Fragment fragment = new Schedule_school();
                fragmentTransaction.add(R.id.container, fragment);
                fragmentTransaction.addToBackStack(null);
                fragmentTransaction.commit();
            }
        });
        adapter.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                int position = recyclerView.getChildAdapterPosition(v);
                if (position != RecyclerView.NO_POSITION) {
                    selectedItem = position;
                    School_DataItem clickedItem = School_dataList.get(position);
                    String deviceId = clickedItem.getDeviceId();
                    moveCameraToMarker(deviceId);
                }
            }
        });
        return view;
    }
    @Override
    public void onAttach(@NonNull Context context) {
        super.onAttach(context);
        BusRoute();
    }

    @SuppressLint({"DefaultLocale", "NotifyDataSetChanged"})
    public void onStart(){
        super.onStart();
        isrunning = true;
        BusData();
    }
    private void BusRoute() {
        client.setRegion(Region.getRegion(Regions.AP_NORTHEAST_2));
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
                }
            }
        });
        routethread.start();
    }
    @SuppressLint("NotifyDataSetChanged")
    private void BusData(){
        client.setRegion(Region.getRegion(Regions.AP_NORTHEAST_2));
        datathread = new Thread(() -> {
            while (isrunning) {
                ScanRequest request = new ScanRequest()
                        .withTableName("Borigps");
                ScanResult result = client.scan(request);
                List<Map<String, AttributeValue>> items = result.getItems();
                if (!(datathread.isInterrupted())) {
                    requireActivity().runOnUiThread(() -> {
                        School_dataList.clear();
                        for (Map<String, AttributeValue> item : items) {
                            deviceid = Objects.requireNonNull(item.get("deviceid")).getS();
                            destination = Objects.requireNonNull(item.get("destination")).getS();
                            type = Objects.requireNonNull(item.get("type")).getS();
                            time = Objects.requireNonNull(item.get("time")).getS();
                            turnYn = Objects.requireNonNull(item.get("turnYn")).getS();
                            distance = Objects.requireNonNull(item.get("distance")).getS();
                            distance_now = Objects.requireNonNull(item.get("distance_now")).getS();
                            String latitudeStr = item.get("latitude") != null ? Objects.requireNonNull(item.get("latitude")).getS() : null;
                            String longitudeStr = item.get("longitude") != null ? Objects.requireNonNull(item.get("longitude")).getS() : null;
                            Run = item.get("Run") != null ? Objects.requireNonNull(item.get("Run")).getS() : null;
                            School_DataItem dataItem = new School_DataItem(deviceid, destination, type, time, turnYn, latLng, Run, distance, distance_now);
                            if (latitudeStr != null && longitudeStr != null) {
                                double latitude = Double.parseDouble(latitudeStr);
                                double longitude = Double.parseDouble(longitudeStr);
                                latLng = new LatLng(latitude, longitude);

                                Marker existingMarker = markers.get(deviceid);
                                if (latLng != null && deviceid != null && time != null) {
                                    if (existingMarker != null) {
                                        existingMarker.setPosition(latLng);
                                        existingMarker.setTitle(time);
                                        if (Run.equals("운행 중")){
                                            School_dataList.add(dataItem);
                                            existingMarker.setVisible(true);
                                        }else {
                                            existingMarker.setVisible(false);
                                        }
                                        if (existingMarker.isInfoWindowShown()){
                                            existingMarker.showInfoWindow();
                                        }
                                        if (School_dataList.isEmpty()){
                                            progressBar.setVisibility(View.GONE);
                                        }
                                    } else {
                                        MarkerOptions markerOptions = new MarkerOptions().position(latLng);
                                        markerOptions.title(time);
                                        markerOptions.icon(BitmapDescriptorFactory.fromResource(R.drawable.schoolbusicon_50));
                                        Marker newMarker = googleMap.addMarker(markerOptions);
                                        markers.put(deviceid, newMarker);
                                        if (Run.equals("운행 중")){
                                            Objects.requireNonNull(newMarker).setVisible(true);
                                        }else {
                                            Objects.requireNonNull(newMarker).setVisible(false);
                                        }
                                    }
                                }
                                int size = adapter.getItemCount();
                                recyclerView.setMinimumHeight(size*100);
                                if (size > 3) {
                                    recyclerView.setMinimumHeight(300);
                                }
                                if (size > 0) {
                                    progressBar.setVisibility(View.GONE);
                                }
                                adapter.updateAdapterData(School_dataList);
                            }
                        }
                    });
                }

                try {
                    Thread.sleep(3000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    isrunning = false;
                    if (datathread.isInterrupted()){
                        isrunning = true;
                        datathread.start();
                    }
                }
            }
        });
        datathread.start();
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
    private void moveCameraToMarker(String deviceId) {
        if (deviceId != null && markers.containsKey(deviceId)) {
            Marker marker = markers.get(deviceId);
            if (marker != null) {
                LatLng markerPosition = marker.getPosition();
                marker.showInfoWindow();
                googleMap.animateCamera(CameraUpdateFactory.newLatLng(markerPosition), 250, null);
            }
        }
    }
    @Override
    public void onStop() {
        super.onStop();
        isrunning = false;
        datathread.interrupt();
    }
    @Override
    public void onDestroy() {
        super.onDestroy();
        isrunning = false;
        datathread.interrupt();
    }
    private void moveCameraToLocation(LatLng location, float zoom) {
        if (googleMap != null) {
            googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(location, zoom));
        }
    }
}