# Лекция 22. Java / Spring Boot — архитектура, REST API, безопасность, данные, конфигурация, тестирование, деплой

## Цель
Научиться строить production‑ориентированные REST сервисы на Spring Boot: понять слои приложения (Controller/Service/Repository), работу с данными (JPA/Hibernate), миграции, валидацию, обработку ошибок, безопасность (Spring Security, JWT), управление конфигурацией и профилями, мониторинг (Actuator), тестирование (JUnit/MockMvc), упаковку и развёртывание.

## План (расширенный)
1. Экосистема Spring: Framework vs Boot, стартеры, автоконфигурация.
2. Инверсия управления (IoC) и DI контейнер, жизненный цикл бина.
3. Структура проекта: Maven/Gradle, пакеты, слои.
4. REST: контроллеры, DTO, конвертация, фильтрация, пагинация.
5. Валидация (Bean Validation), глобальные ошибки (`@ControllerAdvice`).
6. Доступ к данным: JPA сущности, Spring Data репозитории, запросы, lazy/eager, оптимизация.
7. Миграции схемы: Flyway vs Liquibase.
8. Транзакции (`@Transactional`) и каскады.
9. Безопасность: Spring Security фильтр‑чейн, basic, form login, JWT Resource Server.
10. CORS, CSRF, пароли, шифрование (`BCryptPasswordEncoder`).
11. Конфигурация: `application.yml`, профили, `@ConfigurationProperties`, секреты.
12. Логирование: SLF4J + Logback, уровни логов.
13. Мониторинг: Actuator, метрики, health checks.
14. Тестирование: Unit (Service), Web (MockMvc), репозитории (DataJpaTest), Testcontainers.
15. Производительность: N+1, кеш 2‑го уровня, `@EntityGraph`, batch operations.
16. Деплой: JAR, Docker, Gunicorn‑аналог? (в Java — встроенный сервер, внешние контейнеры), JVM настройки.
17. Практика: CRUD + JWT + валидатор + обработка ошибок.
18. Самопроверка.

---

## 1. Экосистема Spring
Spring Framework (ядро) предоставляет DI контейнер, AOP, контракты. Spring Boot добавляет "opinionated" автоконфигурацию и стартеры:
```plaintext
spring-boot-starter-web          (Tomcat + Spring MVC)
spring-boot-starter-validation   (Bean Validation Hibernate Validator)
spring-boot-starter-data-jpa     (Spring Data + Hibernate)
spring-boot-starter-security     (Spring Security)
spring-boot-starter-actuator     (метрики/эндпоинты управления)
```
Автоконфигурация ищет классpath и применяет типичные настройки (например, если есть H2 → создаёт DataSource автоматически).

### Запуск приложения
`@SpringBootApplication` = `@Configuration + @EnableAutoConfiguration + @ComponentScan`.
```java
@SpringBootApplication
public class DemoApplication {
  public static void main(String[] args) { SpringApplication.run(DemoApplication.class, args); }
}
```

## 2. IoC и DI
Контейнер управляет созданием бинов (`@Component`, `@Service`, `@Repository`, `@Controller`).
Конструкторная инъекция предпочтительна (immutable зависимости, легко тестировать).

```java
@Service
public class EmailService {
  private final MailSender sender;
  public EmailService(MailSender sender) { this.sender = sender; }
  public void send(String to, String subj) { sender.send(to, subj); }
}
```
Области: Singleton (по умолчанию), Prototype, RequestScoped, SessionScoped.

## 3. Структура проекта
```plaintext
src/main/java/com/example/demo/
  DemoApplication.java
  config/          # Конфигурационные классы
  controller/      # REST контроллеры
  service/         # Бизнес-логика
  repository/      # Репозитории Spring Data
  domain/          # Сущности (JPA)
  dto/             # DTO классы
  security/        # Безопасность (фильтры, конфиг)
```

Слои помогают поддерживать читаемость и SOLID.

## 4. REST API

### DTO и маппинг
Не всегда хотим отдавать всю сущность (скрыть поля). Используем record (Java 17+):
```java
public record BookDto(Long id, String title, String author, int year) {}
```

### Контроллер
```java
@RestController
@RequestMapping("/api/books")
public class BookController {
  private final BookService service;
  public BookController(BookService service) { this.service = service; }

  @GetMapping
  public Page<BookDto> list(@RequestParam(defaultValue="0") int page,
                            @RequestParam(defaultValue="10") int size) {
    return service.list(PageRequest.of(page, size));
  }

  @PostMapping
  public ResponseEntity<BookDto> create(@Valid @RequestBody CreateBook req) {
    return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
  }
}
```

### Сервис
```java
@Service
public class BookService {
  private final BookRepository repo;
  public BookService(BookRepository repo) { this.repo = repo; }

  public Page<BookDto> list(Pageable pageable) {
    return repo.findAll(pageable).map(this::toDto);
  }
  public BookDto create(CreateBook req) {
    var b = new Book(); b.setTitle(req.title()); b.setAuthor(req.author()); b.setYear(req.year());
    repo.save(b); return toDto(b);
  }
  private BookDto toDto(Book b) { return new BookDto(b.getId(), b.getTitle(), b.getAuthor(), b.getYear()); }
}
```

## 5. Валидация и ошибки

### Bean Validation
```java
public record CreateBook(
  @NotBlank String title,
  @NotBlank String author,
  @Min(1500) @Max(2100) int year
) {}
```
Автоматически активируется через `spring-boot-starter-validation`.

### Глобальный обработчик
```java
@RestControllerAdvice
public class GlobalErrors {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException e) {
    var errors = e.getBindingResult().getFieldErrors().stream()
      .map(fe -> Map.of("field", fe.getField(), "message", fe.getDefaultMessage()))
      .toList();
    return ResponseEntity.badRequest().body(Map.of("errors", errors));
  }

  @ExceptionHandler(EntityNotFoundException.class)
  public ResponseEntity<?> notFound(EntityNotFoundException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
  }
}
```

## 6. Доступ к данным (JPA / Hibernate)
### Сущность
```java
@Entity
@Table(name="books")
public class Book {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  private String title;
  private String author;
  private int year;
  // getters/setters
}
```
### Репозиторий
```java
public interface BookRepository extends JpaRepository<Book, Long> {
  List<Book> findByAuthorContainingIgnoreCase(String author);
}
```
### Запросы и пагинация
```java
repo.findAll(PageRequest.of(0, 20, Sort.by("title")));
repo.findByAuthorContainingIgnoreCase("Tolstoy");
```

### LAZY vs EAGER
Связи `@ManyToOne` по умолчанию EAGER в старых версиях — может вызывать N+1. Используйте `fetch = FetchType.LAZY` + `join fetch` / `EntityGraph`.

### Транзакции
```java
@Transactional
public void updateTitle(Long id, String newTitle) {
  var b = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Book"));
  b.setTitle(newTitle); // dirty checking
}
```

## 7. Миграции: Flyway vs Liquibase (обзор)
Flyway — SQL/инкрементальные скрипты: `V1__init.sql`, `V2__add_index.sql`.
Liquibase — XML/YAML/JSON changelog + генерация diff. Выбор зависит от требований.

Пример Flyway скрипта:
```sql
-- src/main/resources/db/migration/V1__create_books.sql
CREATE TABLE books(
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  year INT NOT NULL
);
```

## 8. Безопасность: Spring Security
Фильтр‑чейн оборачивает запрос:
```plaintext
Request → SecurityFilterChain → Authentication → Authorization → Controller
```

### Базовый конфиг (stateless + JWT)
```java
@Configuration
public class SecurityConfig {
  @Bean
  SecurityFilterChain security(HttpSecurity http) throws Exception {
    http.csrf(cs -> cs.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/auth/**", "/actuator/health").permitAll()
            .anyRequest().authenticated())
        .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()));
    return http.build();
  }

  @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}
```

### Генерация JWT вручную (для обучения)
В проде чаще внешний IdP (Keycloak, Auth0) или Authorization Server.
```java
public class JwtUtil {
  private final String secret = "CHANGE_ME";
  public String generateToken(String username) {
    var now = Instant.now();
    return Jwts.builder()
      .setSubject(username)
      .setIssuedAt(Date.from(now))
      .setExpiration(Date.from(now.plus(1, ChronoUnit.HOURS)))
      .signWith(Keys.hmacShaKeyFor(secret.getBytes()), SignatureAlgorithm.HS256)
      .compact();
  }
}
```

### CORS / CSRF
Для REST JWT → чаще `csrf` отключён. CORS настраивается:
```java
@Bean
public WebMvcConfigurer corsConfigurer() {
  return new WebMvcConfigurer() {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
      registry.addMapping("/api/**").allowedOrigins("https://frontend.example").allowedMethods("GET","POST","PUT","DELETE");
    }
  };
}
```

## 9. Конфигурация и профили
`application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:demo
    driver-class-name: org.h2.Driver
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: update
```
`application-prod.yml` (PostgreSQL):
```yaml
spring:
  datasource:
    url: jdbc:postgresql://db:5432/app
    username: app
    password: ${DB_PASSWORD}
```

Активация: `--spring.profiles.active=prod`.

### @ConfigurationProperties
```java
@ConfigurationProperties(prefix="storage")
public record StorageProps(String bucket, int maxFiles) {}

@EnableConfigurationProperties(StorageProps.class)
@Configuration
public class StorageConfig {}
```
Использование: инжектировать `StorageProps` в сервис.

## 10. Логирование
SLF4J фасад + Logback. Пример:
```java
private static final Logger log = LoggerFactory.getLogger(BookService.class);
log.info("Creating book: {}", req.title());
log.error("Failed to create book", ex);
```
Настройка уровня логов в `application.yml`:
```yaml
logging:
  level:
    root: INFO
    org.hibernate.SQL: DEBUG
```

## 11. Мониторинг: Actuator
Добавьте зависимость `spring-boot-starter-actuator`.
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```
Проверка: `GET /actuator/health`, `GET /actuator/metrics/jvm.memory.used`.

## 12. Тестирование

### Сервисный тест
```java
@SpringBootTest
public class BookServiceTest {
  @Autowired BookService service;
  @Test void createBook() {
    var dto = service.create(new CreateBook("Title","Author",2000));
    assertNotNull(dto.id());
  }
}
```

### Web слой с MockMvc
```java
@WebMvcTest(BookController.class)
public class BookControllerTest {
  @Autowired MockMvc mvc;
  @MockBean BookService service;

  @Test void listBooks() throws Exception {
    when(service.list(PageRequest.of(0,10))).thenReturn(Page.empty());
    mvc.perform(get("/api/books"))
       .andExpect(status().isOk());
  }
}
```

### Репозиторий тест
```java
@DataJpaTest
public class BookRepositoryTest {
  @Autowired BookRepository repo;
  @Test void saveAndFind() {
    var b = new Book(); b.setTitle("T"); b.setAuthor("A"); b.setYear(2020); repo.save(b);
    assertFalse(repo.findByAuthorContainingIgnoreCase("A").isEmpty());
  }
}
```

### Testcontainers (для реальной БД)
Позволяет поднять PostgreSQL в контейнере для интеграционных тестов.

## 13. Производительность
Проблемы: N+1, большая нагрузка на GC, неэффективные запросы.
Решения:
- Использовать `select fetch` (EntityGraph) для связанных сущностей.
- Кеш уровня 2 (EHCache, Hazelcast) при необходимости.
- Пакетные операции (`hibernate.jdbc.batch_size`).
```yaml
spring:
  jpa:
    properties:
      hibernate.jdbc.batch_size: 30
```

## 14. Деплой и упаковка
Собираем fat JAR: `mvn clean package` → `target/app.jar`.
Запуск: `java -jar app.jar`.

### Dockerfile пример
```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/app.jar app.jar
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75"
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
```

### JVM тюнинг (базово)
- MaxRAMPercentage
- GC: G1 (по умолчанию Java 17), ZGC при больших heap.

## 15. Практическое задание
Реализуйте сервис "Library":
1. Сущность `Book(id,title,author,year,available:boolean)`.
2. CRUD эндпоинты (GET /books, POST /books, PUT /books/{id}, DELETE /books/{id}).
3. Валидация полей (`@NotBlank`, диапазон года).
4. Глобальная обработка ошибок.
5. Включить Actuator (health + metrics).
6. Добавить фильтрацию по автору: `GET /books?author=...`.
7. Реализовать JWT проверку (можно имитация: передача `Authorization: Bearer <token>` и простая верификация подписи).
8. Написать минимум 3 теста: сервис, контроллер, репозиторий.

Дополнительно (опционально): кеширование списка книг; Dockerfile; миграции Flyway.

## 16. Дополнительные материалы
- Spring Boot Docs: https://spring.io/projects/spring-boot
- Spring Guides: https://spring.io/guides
- Spring Security Reference.
- Hibernate User Guide.
- Flyway Docs / Liquibase Docs.
- Testcontainers.
- "Spring Boot in Action" (книга).

## 17. Вопросы для самопроверки
1. Что делает `@SpringBootApplication`?
2. Разница между `@Component`, `@Service`, `@Repository`?
3. Зачем DTO, если есть сущности JPA?
4. Как работает валидация и где обрабатываются ошибки?
5. Что такое LAZY загрузка и почему возникает N+1?
6. Разница между Flyway и Liquibase?
7. Какие шаги аутентификации происходят в Spring Security?
8. Зачем отключать `csrf` в REST API?
9. Как настроить разные конфиги для prod и dev?
10. Когда нужен Actuator и какие эндпоинты экспонировать осторожно?
11. Как протестировать контроллер, не поднимая всю БД?
12. Что даёт `@Transactional` в сервисе?
13. Какие риски у слишком агрессивного логирования?
14. Чем JWT лучше сессий и какие у него минусы?
15. Для чего второй уровень кеша Hibernate?

---
**Итог:** Spring Boot упрощает создание производственных сервисов на Java, предоставляя готовые решения для конфигурации, данных, безопасности, мониторинга и тестирования. Понимание слоёв и паттернов позволяет строить расширяемую и поддерживаемую архитектуру.
