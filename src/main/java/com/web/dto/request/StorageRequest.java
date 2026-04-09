package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class StorageRequest {

    private Long id;

    private String ram;

    private String rom;

    private List<ColorRequest> color = new ArrayList<>();
}
