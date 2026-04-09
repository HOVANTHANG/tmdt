package com.web.repository;

import com.web.entity.Guarantee;
import com.web.entity.GuaranteeHistory;
import com.web.enums.GuaranteeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GuaranteeHistoryRepository extends JpaRepository<GuaranteeHistory, Long> {

}
