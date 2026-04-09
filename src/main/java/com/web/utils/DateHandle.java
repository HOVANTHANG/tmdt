package com.web.utils;

import java.sql.Date;
import java.util.*;

public class DateHandle {

    public List<Date> convertStringToDate(String thu, Date ngayBatDau, Date ngayKt){
        List<Date> list = new ArrayList<>();
        String[] str = thu.split(",");

        for(String s : str){
            Calendar c = Calendar.getInstance();
            c.setTime(ngayBatDau);
            int dayOfWeek = c.get(Calendar.DAY_OF_WEEK);
            Integer thubd = Integer.valueOf(s);
            Integer khoangcach = 0;
            if(thubd != 1) {
                khoangcach = thubd - dayOfWeek;
            }
            else{
                khoangcach = 8 - dayOfWeek;
            }

            Long ngaybds = ngayBatDau.getTime() + khoangcach * 1000L * 60L * 60L * 24L;

            Long longkt = ngayKt.getTime();
            while(ngaybds <= longkt){
                Date ds = new Date(ngaybds);
                list.add(ds);
                ngaybds = ngaybds + (1000L * 60L * 60L * 24L * 7L) ;
            }
        }

        Collections.sort(list, new Comparator<Date>() {
            @Override
            public int compare(Date o1, Date o2) {
                return o1.compareTo(o2);
            }
        });

        return list;
    }

    public static void main(String[] args) {
        Date ngayBd = Date.valueOf("2023-04-05");
        Date ngaykt = Date.valueOf("2023-06-05");
        new DateHandle().convertStringToDate("2,4", ngayBd, ngaykt).forEach(p->{
            System.out.println(p.toString());
        });
    }
}

