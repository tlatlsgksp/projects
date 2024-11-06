package com.kdu.busboristudent;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.ToggleButton;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.kdu.busbori.R;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class Notify_Adapter extends RecyclerView.Adapter<Notify_Adapter.ViewHolder> {
    private List<Notify_DataItem> Notify_dataList;
    private View.OnClickListener onItemClickListener;
    private SharedPreferences sharedPreferences;
    private SharedPreferences.Editor editor;
    private Set<String> notifyList;
    private Context context;
    public Notify_Adapter(List<Notify_DataItem> Notify_dataList, Context context) {
        this.Notify_dataList = Notify_dataList;
        this.context = context;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.listnotify_item_layout, parent, false);
        return new ViewHolder(view);
    }
    @SuppressLint({"NotifyDataSetChanged", "SetTextI18n"})
    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Notify_DataItem item = Notify_dataList.get(position);
        if (item.getType().equals("등교")){
            holder.viewbar.setText("등\n교");
            holder.viewbar.setTextColor(Color.parseColor("#99CC99"));
            holder.viewbar.setBackgroundColor(Color.parseColor("#CCFFCC"));
            holder.itemLayout.setBackgroundColor(Color.parseColor("#FBFFFB"));
        }else {
            holder.viewbar.setText("하\n교");
            holder.viewbar.setTextColor(Color.parseColor("#CC9999"));
            holder.viewbar.setBackgroundColor(Color.parseColor("#FFCCCC"));
            holder.itemLayout.setBackgroundColor(Color.parseColor("#FFFBFB"));
        }
        holder.textView1.setText(item.getDestination());
        holder.textView2.setText(item.getTime());
        holder.textView3.setText(" 배차 : " + item.getButtonText() + "대");
        holder.notifyButton.setChecked(item.isNotify());
    }

    @Override
    public int getItemCount() {
        return Notify_dataList.size();
    }

    public class ViewHolder extends RecyclerView.ViewHolder {
        public TextView textView1;
        public TextView textView2;
        public TextView textView3;
        public LinearLayout itemLayout;
        public ToggleButton notifyButton;
        public TextView viewbar;
        @SuppressLint("ResourceType")
        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            textView1 = itemView.findViewById(R.id.textview1);
            textView2 = itemView.findViewById(R.id.textview2);
            textView3 = itemView.findViewById(R.id.textview3);
            itemLayout = itemView.findViewById(R.id.item_layout);
            notifyButton = itemView.findViewById(R.id.notify_toggle_button);
            viewbar = itemView.findViewById(R.id.viewbar);

            itemView.setOnClickListener(new View.OnClickListener() {
                @SuppressLint("NotifyDataSetChanged")
                @Override
                public void onClick(View v) {
                    int position = getAdapterPosition();
                    if (position != RecyclerView.NO_POSITION && onItemClickListener != null) {
                        onItemClickListener.onClick(v);
                    }
                }
            });

            notifyButton.setOnClickListener(new View.OnClickListener() {
                @SuppressLint("MutatingSharedPrefs")
                @Override
                public void onClick(View v) {
                    int position = getAdapterPosition();
                    if (position != RecyclerView.NO_POSITION) {
                        Notify_DataItem clickedItem = Notify_dataList.get(position);
                        String destination = clickedItem.getDestination();
                        String type = clickedItem.getType();
                        String time = clickedItem.getTime();
                        String combine = destination + type + time;
                        boolean isNotify = clickedItem.isNotify();

                        if (notifyButton.isChecked() && !isNotify) {
                            notifyList.add(combine);
                            clickedItem.setNotify(true);
                        } else if (!notifyButton.isChecked() && isNotify) {
                            notifyList.remove(combine);
                            clickedItem.setNotify(false);
                        }
                        editor = sharedPreferences.edit();
                        editor.clear();
                        editor.putStringSet("notify", notifyList);
                        editor.apply();
                    }
                }
            });
        }
    }
    public void setOnClickListener(View.OnClickListener listener) {
        onItemClickListener = listener;
    }
    @SuppressLint("NotifyDataSetChanged")
    public void updateAdapterData(List<Notify_DataItem> newdataList, Context context) {
        this.Notify_dataList = newdataList;
        this.context = context;
        Notify_dataList.sort(new Comparator<Notify_DataItem>() {
            @Override
            public int compare(Notify_DataItem dataList1, Notify_DataItem dataList2) {
                return dataList1.getAssort().compareTo(dataList2.getAssort());
            }
        });
        sharedPreferences = context.getSharedPreferences("notify", Context.MODE_PRIVATE);
        notifyList = sharedPreferences.getStringSet("notify", new LinkedHashSet<>());
        for (Notify_DataItem item : Notify_dataList) {
            String destination = item.getDestination();
            String type = item.getType();
            String time = item.getTime();
            String combine = destination + type + time;
            boolean isNotify = notifyList.contains(combine);
            item.setNotify(isNotify);
        }
        notifyDataSetChanged();
    }
}