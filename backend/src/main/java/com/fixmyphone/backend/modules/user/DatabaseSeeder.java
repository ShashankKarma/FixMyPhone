package com.fixmyphone.backend.modules.user;

import com.fixmyphone.backend.modules.shop.RepairShop;
import com.fixmyphone.backend.modules.shop.RepairShopRepository;
import com.fixmyphone.backend.modules.shop.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RepairShopRepository repairShopRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.seeder.admin.email:admin@example.com}")
    private String adminEmail;

    @Value("${app.seeder.admin.password:AdminPassword123!}")
    private String adminPassword;

    @Value("${app.seeder.owner.email:owner@example.com}")
    private String ownerEmail;

    @Value("${app.seeder.owner.password:OwnerPassword123!}")
    private String ownerPassword;

    @Value("${app.seeder.shop.name:Fixit Pro}")
    private String shopName;

    @Value("${app.seeder.shop.email:info@example.com}")
    private String shopEmail;

    @Value("${app.seeder.shop.phone:1234567890}")
    private String shopPhone;

    @Value("${app.seeder.shop.address:Shop Address}")
    private String shopAddress;

    @Override
    public void run(String... args) throws Exception {
        // Seed Roles
        seedRole(RoleName.ROLE_CUSTOMER);
        seedRole(RoleName.ROLE_SHOP_OWNER);
        seedRole(RoleName.ROLE_ADMIN);

        // Seed Default Admin User
        seedAdminUser();

        // Seed Default Customer
        seedCustomerUser();

        // Seed Default Shop Owner and Shop
        seedShopOwnerAndShop();
    }

    private void seedRole(RoleName roleName) {
        Optional<Role> roleOpt = roleRepository.findByName(roleName);
        if (roleOpt.isEmpty()) {
            Role role = Role.builder().name(roleName).build();
            roleRepository.save(role);
        }
    }

    private void seedAdminUser() {
        Optional<User> adminOpt = userRepository.findByEmail(adminEmail);
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            admin.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(admin);
        } else {
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

            User admin = User.builder()
                    .name("System Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .phone("+1234567890")
                    .roles(Collections.singleton(adminRole))
                    .isEmailVerified(true)
                    .isLocked(false)
                    .failedAttempts(0)
                    .build();

            userRepository.save(admin);
            System.out.println("Seeded default admin user: " + adminEmail);
        }
    }

    private void seedCustomerUser() {
        if (!userRepository.existsByEmail("customer@fixmyphone.com")) {
            Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                    .orElseThrow(() -> new RuntimeException("ROLE_CUSTOMER not found"));

            User customer = User.builder()
                    .name("John Customer")
                    .email("customer@fixmyphone.com")
                    .password(passwordEncoder.encode("customer123"))
                    .phone("+15550199")
                    .roles(Collections.singleton(customerRole))
                    .isEmailVerified(true)
                    .isLocked(false)
                    .failedAttempts(0)
                    .build();

            userRepository.save(customer);
            System.out.println("Seeded default customer user: customer@fixmyphone.com / customer123");
        }
    }

    private void seedShopOwnerAndShop() {
        Optional<User> ownerOpt = userRepository.findByEmail(ownerEmail);
        if (ownerOpt.isPresent()) {
            User owner = ownerOpt.get();
            owner.setPassword(passwordEncoder.encode(ownerPassword));
            userRepository.save(owner);
        } else {
            Role ownerRole = roleRepository.findByName(RoleName.ROLE_SHOP_OWNER)
                    .orElseThrow(() -> new RuntimeException("ROLE_SHOP_OWNER not found"));

            User owner = User.builder()
                    .name("Sarah Shopowner")
                    .email(ownerEmail)
                    .password(passwordEncoder.encode(ownerPassword))
                    .phone("+15550188")
                    .roles(Collections.singleton(ownerRole))
                    .isEmailVerified(true)
                    .isLocked(false)
                    .failedAttempts(0)
                    .build();

            owner = userRepository.save(owner);
            System.out.println("Seeded default shop owner user: " + ownerEmail);

            // Seed Shop
            RepairShop shop = RepairShop.builder()
                    .owner(owner)
                    .name(shopName)
                    .description("Certified premium mobile repair shop specializing in screens, batteries, and liquid damage recovery.")
                    .address(shopAddress)
                    .city("Mhow")
                    .state("MP")
                    .zipCode("453441")
                    .latitude(22.5539)
                    .longitude(75.7644)
                    .phone(shopPhone)
                    .email(shopEmail)
                    .rating(new BigDecimal("4.8"))
                    .totalReviews(24)
                    .isApproved(true)
                    .build();

            shop = repairShopRepository.save(shop);
            System.out.println("Seeded default approved shop: " + shopName);

            // Seed Services
            com.fixmyphone.backend.modules.shop.Service s1 = com.fixmyphone.backend.modules.shop.Service.builder()
                    .shop(shop)
                    .name("Screen Replacement")
                    .customName("OEM Quality Screen")
                    .price(new BigDecimal("109.99"))
                    .durationMinutes(45)
                    .isAvailable(true)
                    .build();

            com.fixmyphone.backend.modules.shop.Service s2 = com.fixmyphone.backend.modules.shop.Service.builder()
                    .shop(shop)
                    .name("Battery Replacement")
                    .customName("High Capacity Battery")
                    .price(new BigDecimal("59.99"))
                    .durationMinutes(30)
                    .isAvailable(true)
                    .build();

            com.fixmyphone.backend.modules.shop.Service s3 = com.fixmyphone.backend.modules.shop.Service.builder()
                    .shop(shop)
                    .name("Charging Port Repair")
                    .price(new BigDecimal("79.99"))
                    .durationMinutes(60)
                    .isAvailable(true)
                    .build();

            serviceRepository.save(s1);
            serviceRepository.save(s2);
            serviceRepository.save(s3);
            System.out.println("Seeded default services for " + shopName);
        }
    }
}
