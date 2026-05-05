package com.web.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.sql.Date;
import java.sql.Time;

@Entity
@Getter
@Setter
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Date createdDate;

    private Time createdTime;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private ChatRoom room;
}