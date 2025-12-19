# Лекция 26. DevOps: CI/CD, Docker, Kubernetes и облачные деплойменты

## Короткий контекст
Эта лекция знакомит с практическим конвейером поставки: от коммита до работающего контейнера в облаке через GitHub Actions, Docker и Kubernetes, с акцентом на воспроизводимость, наблюдаемость и безопасность.

## Результаты обучения
- Понимать этапы типичного CI/CD конвейера и метрики DORA.
- Создавать оптимизированные Docker-образы (multi-stage, без лишних слоёв).
- Применять базовые Kubernetes объекты (Deployment, Service, Ingress) для приложения.
- Настраивать GitHub Actions workflow для сборки, тестирования и деплоя.
- Оценивать надежность и безопасность конвейера (секреты, сканирование образов).

## Пререквизиты
- Умение пользоваться Git (commit, branch, push, pull request).
- Базовое знание Docker (образ, контейнер) и CLI.
- Минимальное представление о YAML.
- Основы сетей (порт, протокол HTTP) и терминов REST.
- Желательно: базовые команды `kubectl` и понятие Deployment.

## Введение: картина мира
Представьте заводскую конвейерную линию: идея (код) поступает на сборку, проходит контроль качества (тесты/линт), упаковку (образ), транспорт (registry) и установку (кластер). DevOps — это не один инструмент, а культура сокращения цикла обратной связи между разработкой и эксплуатацией.

Аналогии:
1. Docker — «контейнерная тарелка» со всеми ингредиентами приложения.
2. Kubernetes — «порт управления» распределённым флотом контейнеров.
3. CI/CD — «автоматический конвейер» проверок и поставки в порт.

Как это ощущается в реальном проекте: меньше «работает у меня», быстрее релизы, видимость статуса сборок, воспроизводимые окружения.

## Основные понятия и терминология
- CI (Continuous Integration): автоматическая сборка и тесты при изменении кода.
- CD (Continuous Delivery/Deployment): автоматизация выкладки; Delivery — готовность к релизу, Deployment — фактическая выкладка.
- Pipeline (конвейер): последовательность шагов (jobs/stages) сборки и поставки.
- Docker Image: неизменяемый шаблон файловой системы приложения.
- Registry: хранилище образов (Docker Hub, GHCR, ECR, GCR).
- Kubernetes Cluster: набор узлов (nodes) и управляющих компонентов (control plane).
- Deployment: контроллер управления репликами (pods), обновлениями.
- Service: стабильная точка доступа (виртуальный IP/ClusterIP) к набору pod.
- Ingress: правила маршрутизации внешнего HTTP трафика внутрь кластера.
- Secrets: чувствительные данные (ключи, токены) в безопасном виде.
- DORA метрики: Lead Time, Deployment Frequency, MTTR, Change Failure Rate.

Контра-примеры:
- CI без тестов — просто автоматическая сборка, а не полноценная интеграция.
- «Kubernetes без наблюдаемости» превращается в сложный чёрный ящик.

---

## Пошаговое освоение темы

Будем идти по возрастающей: (1) Метрики и структура pipeline → (2) Оптимизация Docker → (3) Kubernetes базовые объекты → (4) CI/CD workflow → (5) Облачный деплой и окружения → (6) Observability в конвейере → (7) Безопасность/DevSecOps → (8) Стратегии релизов.

### Подтема 1. CI/CD структура и метрики

#### Определения
- Lead Time: время от коммита до успешного деплоя в прод.
- MTTR: среднее время восстановления после инцидента: $MTTR = \frac{\sum t_{repair}}{N}$.
- Change Failure Rate: доля изменений, приводящих к инцидентам.

Мини-пример: схема стадии конвейера (ASCII)

```
[Commit] -> [Build & Lint] -> [Unit Tests] -> [Image Build] -> [Push Registry] -> [Deploy Staging] -> [Smoke Tests] -> [Manual/Auto Prod Deploy]
```

Пояснение к примеру: Показывает последовательность стандартных шагов, которые можно дополнить статическим анализом (SAST), сканером зависимостей и подписанием образов.
Проверка: Сопоставьте текущий workflow вашего проекта со стадиями и отметьте пропуски (например, нет сканирования зависимостей).
Типичные ошибки:
- Смешивание сборки и тестов в одном непрозрачном шаге.
- Отсутствие метрик времени (нет сбора Lead Time).
- Нет отдельной проверки на уязвимости зависимостей.

### Подтема 2. Оптимизированный Docker образ (multi-stage)

#### Определения
- Multi-stage build: использование нескольких FROM для уменьшения конечного образа.
- Layer caching: повторное использование слоёв при неизменённых инструкциях.

Пример Dockerfile (Node.js приложение):

```dockerfile
# Стейдж 1: сборка
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Стейдж 2: минимальный рантайм
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
# Только нужные файлы
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
RUN npm ci --only=production --ignore-scripts
USER node
CMD ["node", "dist/index.js"]
```

Пояснение к примеру: Разделение стадии сборки и исполнения сокращает размер и уменьшает поверхность атаки.
Проверка:
1. `docker build -t demo-app:latest .`
2. `docker run --rm demo-app:latest` — ожидается запуск сервера.
3. `docker image inspect demo-app:latest` — смотрим размер (должен быть меньше монолитного образа).
Типичные ошибки:
- Использование `npm install` вместо `npm ci` (неповторимые билды).
- Копирование `node_modules` из билд-стейджа без пересборки производственной части.
- Оставленные dev-зависимости и инструменты (bash, curl) в финальном образе.

### Подтема 3. Kubernetes: базовые объекты и развёртывание

#### Определения
- Pod: минимальная единица запуска (один или несколько контейнеров).
- ReplicaSet: управляет количеством копий Pod.
- Deployment: стратегическое обновление ReplicaSet (RollingUpdate).
- Service (ClusterIP): стабильный доступ к Pod по селектору.
- Ingress: HTTP маршрутизация, TLS терминация.

Пример манифестов: Deployment + Service + Ingress

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: demo-app
  template:
    metadata:
      labels:
        app: demo-app
    spec:
      containers:
        - name: web
          image: ghcr.io/org/demo-app:1.0.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: demo-app-svc
spec:
  selector:
    app: demo-app
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: demo-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - demo.example.com
      secretName: demo-tls
  rules:
    - host: demo.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: demo-app-svc
                port:
                  number: 80
```

Пояснение к примеру: Deployment обеспечивает управляемый rolling update, probes дают надёжность, Ingress публикует сервис с TLS.
Проверка:
1. `kubectl apply -f deployment.yaml`
2. `kubectl get pods -l app=demo-app` — должно быть 3 Running.
3. `kubectl describe ingress demo-app-ingress` — проверка назначенного адреса.
4. Открыть `https://demo.example.com` → HTTP 200.
Типичные ошибки:
- Отсутствие readinessProbe (риск трафика к неподготовленным Pod).
- Жёсткие лимиты памяти слишком низкие → OOMKilled.
- Пропуск TLS (отсутствие шифрования для внешних клиентов).

### Подтема 4. GitHub Actions Workflow (CI → Build → Deploy)

#### Определения
- Job: группа шагов на отдельном раннере.
- Artifact: сохранённые файлы между задачами.
- Environment: контекст (staging/prod) с политиками.

Пример workflow:

```yaml
name: ci-cd
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install deps
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Unit tests
        run: npm test -- --ci
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist

  docker-image:
    needs: build-test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Login GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build image
        run: docker build -t ghcr.io/${{ github.repository }}/demo-app:${{ github.sha }} .
      - name: Push image
        run: docker push ghcr.io/${{ github.repository }}/demo-app:${{ github.sha }}
      - name: Tag latest
        run: |
          docker tag ghcr.io/${{ github.repository }}/demo-app:${{ github.sha }} ghcr.io/${{ github.repository }}/demo-app:latest
          docker push ghcr.io/${{ github.repository }}/demo-app:latest

  deploy-staging:
    needs: docker-image
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Kube config
        run: echo "${KUBE_CONFIG}" > kubeconfig
        env:
          KUBE_CONFIG: ${{ secrets.KUBE_CONFIG_STAGING }}
      - name: Set kubectl context
        run: export KUBECONFIG=`pwd`/kubeconfig
      - name: Update image
        run: |
          kubectl set image deployment/demo-app web=ghcr.io/${{ github.repository }}/demo-app:${{ github.sha }}
          kubectl rollout status deployment/demo-app --timeout=120s
```

Пояснение к примеру: Три job: тесты, сборка образа, обновление Deployment в staging. Использует секрет kubeconfig.
Проверка:
1. Push в `main` → Workflow запускается.
2. Проверить вкладку Actions: все job зелёные.
3. `kubectl get deploy demo-app` в staging — новая версия (image sha).
Типичные ошибки:
- Сохранение kubeconfig в репозитории (утечка).
- Пропуск тестов/линта → деградация качества.
- Отсутствие явного `rollout status` (незамеченные ошибки деплоя).

### Подтема 5. Облачный деплой и окружения

#### Определения
- Staging: среда, максимально похожая на прод, но без боевых данных.
- Canary release: постепенное включение новой версии для части трафика.
- Infrastructure as Code (IaC): декларативное описание ресурсов (Terraform).

Мини-пример Terraform (фрагмент для k8s namespace и quota):

```hcl
resource "kubernetes_namespace" "demo" {
  metadata {
    name = "demo-staging"
    labels = {
      purpose = "staging"
    }
  }
}

resource "kubernetes_resource_quota" "demo_quota" {
  metadata {
    name      = "demo-quota"
    namespace = kubernetes_namespace.demo.metadata[0].name
  }
  spec {
    hard = {
      pods           = "20"
      requests.cpu   = "2"
      requests.memory= "4Gi"
    }
  }
}
```

Пояснение к примеру: Ограничивает ресурсы для предотвращения исчерпания кластера; reproducible namespace.
Проверка:
1. `terraform init`; `terraform apply`.
2. `kubectl get namespace demo-staging` — существует.
3. `kubectl describe quota demo-quota -n demo-staging` — отражены лимиты.
Типичные ошибки:
- Ручное создание ресурсов без IaC (дрейф конфигурации).
- Отсутствие quota → возможное перепотребление.
- Смешивание staging и prod секретов.

### Подтема 6. Observability в конвейере

#### Определения
- Trace: цепочка распределённых вызовов.
- Metrics: числовые показатели (latency, error_rate).
- Logs: текстовые события для диагностики.

Мини-пример Prometheus annotations в Deployment:

```yaml
metadata:
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "3000"
```

Пояснение к примеру: Позволяет Prometheus автоматически собирать метрики по HTTP endpoint.
Проверка:
1. Убедиться в доступности `/metrics` (HTTP 200, формат OpenMetrics).
2. В Prometheus target статус Up.
3. Строим график `rate(http_requests_total[5m])`.
Типичные ошибки:
- Отсутствие метрик здоровья (сложно измерить эффект деплоя).
- Избыточный логгинг (`debug` в проде) → расходы и шум.
- Нет корреляции версий релиза с ошибками (отсутствует label build_sha).

### Подтема 7. Безопасность и DevSecOps

#### Определения
- SBOM (Software Bill of Materials): список компонентов и зависимостей.
- Image scanning: проверка уязвимостей (CVEs) в образах.
- Secret scanning: поиск утечек ключей в репозитории.

Пример добавления сканирования Trivy (job фрагмент):

```yaml
- name: Scan image
  uses: aquasecurity/trivy-action@v0.14.0
  with:
    image-ref: ghcr.io/${{ github.repository }}/demo-app:${{ github.sha }}
    severity: HIGH,CRITICAL
    format: table
    exit-code: 1
```

Пояснение к примеру: Останавливает pipeline при критических уязвимостях в образе.
Проверка:
1. Вставить шаг в workflow.
2. Провести сборку — при наличии HIGH/CRITICAL уязвимостей job упадёт.
3. Устранить зависимость → повторный проход без ошибок.
Типичные ошибки:
- Игнорирование результатов сканера (просто логирование).
- Хранение секретов в `.env` закоммиченных в репозиторий.
- Отсутствие политики ротации токенов.

### Подтема 8. Стратегии релиза (Rolling, Blue/Green, Canary)

#### Определения
- Rolling Update: постепенное обновление реплик.
- Blue/Green: параллельное поддержание старой и новой среды.
- Canary: ограниченный процент трафика на новую версию.

Мини-пример аннотации для canary (Nginx Ingress, предполагая разделение по header):

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-by-header: "X-Canary"
```

Пояснение к примеру: Перенаправляет запросы с заголовком `X-Canary` к новой версии сервиса.
Проверка:
1. Отправить запрос без заголовка → ответ старая версия.
2. Отправить `curl -H "X-Canary: 1" https://demo.example.com` → новая версия.
3. Сравнить метрики ошибок между версиями.
Типичные ошибки:
- Отсутствие возврата к предыдущей версии при росте ошибок.
- Смешивание состояния (session store) без миграции.
- Слишком быстрый rollout (нет времени на мониторинг).

---

## Разбор типичных ошибок и анти-паттернов
- "Snowflake environments": ручная настройка серверов без IaC → дрейф.
- "Big Bang Deploy": накопление большого пакета изменений без промежуточных релизов → риск.
- Отсутствие health checks → трафик к неготовым контейнерам.
- Использование `latest` тега в прод → нечёткая трассировка версий.
- Секреты в переменных окружения, выведенные в логи.
- Линт отключён "временно" и забывается навсегда → деградация качества.

Признаки:
- Rollback занимает часы.
- Высокий MTTR без видимых причин.
- Неизвестно, какая версия сейчас в прод.

Как чинить:
- Ввести версионирование образов по SHA и дату релиза меткой.
- Добавить автоматическое сканирование зависимостей.
- Обязательный `rollout status` и alerts на error-rate.

---

## Вопросы для самопроверки
1. В чём различие Continuous Delivery и Continuous Deployment?
2. Что даёт multi-stage Docker build по сравнению с одним `FROM`?
3. Зачем нужны readiness и liveness probes, и чем они отличаются?
4. Какие метрики DORA отражают скорость и надёжность поставки?
5. Почему нельзя хранить kubeconfig в открытом репозитории?
6. Что делает `kubectl rollout status` и почему важно?
7. В каких случаях выбирается canary вместо blue/green?
8. Какая роль Service в Kubernetes и что произойдёт без него?
9. Как уменьшить размер Docker-образа Node.js приложения?
10. Что такое SBOM и зачем он нужен безопасности?
11. Какие этапы стоит добавить в pipeline для DevSecOps?
12. Почему тег `latest` нежелателен для прод окружения?
13. Чем отличается Lead Time от MTTR?
14. Как проверить, что метрики корректно собираются в Prometheus?
15. Какие риски при отсутствии resource quotas в namespace?

---

## Краткий конспект (Cheat-sheet)

Команды Docker:

```powershell
docker build -t org/demo:1.0.0 .
docker run --rm -p 3000:3000 org/demo:1.0.0
docker image prune -f
```

Команды Kubernetes:

```powershell
kubectl apply -f deployment.yaml
kubectl get pods -l app=demo-app
kubectl logs deploy/demo-app -c web --tail=100
kubectl set image deployment/demo-app web=ghcr.io/org/demo-app:sha123
kubectl rollout status deployment/demo-app
```

Проверка probes:

```powershell
kubectl describe pod <pod-name>
```

CI/CD (GitHub Actions):
- Файл: `.github/workflows/ci-cd.yml`
- Триггеры: `on.push`, `on.pull_request`

DORA формулы:
- $MTTR = \frac{\sum t_{repair}}{N}$
- Change Failure Rate = $\frac{\text{Неудачные деплои}}{\text{Все деплои}}$

Практические метки:
- Image tag: `demo-app:<git-sha>`
- Labels: `version=<sha>`

---

## Дополнительно

Глоссарий:
- IaC: декларативное описание инфраструктуры.
- Canary: постепенное включение новой версии для ограниченного сегмента.
- RollingUpdate: стратегия по одной/нескольким репликам.
- Probe: HTTP/TCP или exec проверка состояния контейнера.
- GitOps: управление инфраструктурой через Git репозиторий.
- SBOM: перечень зависимостей для аудита безопасности.
- Registry: сервис хранения и раздачи образов.
- Artifact: бинарный или собранный пакет, передаваемый между стадиями.

Рекомендованные ссылки:
- [Kubernetes Docs](https://kubernetes.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Prometheus](https://prometheus.io/docs/introduction/overview/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

Быстрая практика (5 шагов):

```powershell
# 1. Сборка и пуш образа
docker build -t ghcr.io/org/demo-app:dev .
docker push ghcr.io/org/demo-app:dev
# 2. Применение манифестов
kubectl apply -f deployment.yaml
# 3. Проверка состояния
kubectl rollout status deployment/demo-app
# 4. Тест HTTP
curl https://demo.example.com/health
# 5. Просмотр метрик
curl https://demo.example.com/metrics
```

Ожидаемый результат: статус Rollout complete, HTTP 200 на /health, метрики доступны.

Типичные ошибки при быстром запуске:
- Нет проб /health → Rollout проходит без реального здоровья.
- ImagePullBackOff из-за неверного имени образа.
- Не добавлен TLS → незащищённый трафик.

---

## Финальные заметки
При внедрении DevOps не пытайтесь автоматизировать хаос: начните с стандартизации процессов (ветвление, тесты), затем автоматизируйте. Измеряйте результаты (Lead Time, MTTR), постепенно добавляйте безопасность и наблюдаемость.

---

(Конец лекции)
