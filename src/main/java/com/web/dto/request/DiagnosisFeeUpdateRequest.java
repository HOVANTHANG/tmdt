package com.web.dto.request;

public record DiagnosisFeeUpdateRequest(
        String errorDiagnosis,
        Integer fee
) {}