package com.ekonomy.security;

import com.ekonomy.user.User;
import com.ekonomy.user.UserRepository;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

@ApplicationScoped
public class InitService {

    private static final Logger LOG = Logger.getLogger(InitService.class);

    @Inject
    UserRepository userRepository;

    @ConfigProperty(name = "ekonomy.admin.email", defaultValue = "admin@admin.com")
    String adminEmail;

    @ConfigProperty(name = "ekonomy.admin.password", defaultValue = "admin")
    String adminPassword;

    @Transactional
    void onStart(@Observes StartupEvent ev) {
        if (userRepository.count() == 0) {
            User user = new User();
            user.email = adminEmail;
            user.password = BcryptUtil.bcryptHash(adminPassword);
            user.role = "ADMIN";
            userRepository.persist(user);
            LOG.infof("Created admin user: %s", adminEmail);
        }
    }
}
