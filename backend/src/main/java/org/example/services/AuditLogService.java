package org.example.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {
    private static final Logger logger = LoggerFactory.getLogger("AUDIT_LOG");
    public void log(
            String username,
            String action,
            String targetType,
            Integer targetId) {
        logger.info(
            "username={} action={} targetType={} targetId={}",
            username, action, targetType, targetId
        );
    }
}