---
title: "Product Recommendation Engine"
slug: "recommendation-engine"
description: "Build a production-grade hybrid recommendation system on Google Cloud Platform.
    Combine collaborative filtering via BigQuery ML Matrix Factorization with content-based
    embeddings, serve predictions through Vertex AI endpoints, and measure impact with
    A/B testing — turning generic product"
section: "gcp-mle-usecases"
order: 5
badges:
  - "Matrix Factorization"
  - "Content-Based Filtering"
  - "Hybrid Scoring"
  - "Cold-Start Handling"
  - "Feature Store"
  - "A/B Testing"
notebook: "https://colab.research.google.com/github/careeralign/notebooks/blob/main/gcp-mle-usecases/05-recommendation-engine.ipynb"
---

## 01. The Problem

E-commerce conversion rates average only **2–3%** globally. The vast majority of visitors leave without purchasing — not because they lack intent, but because they cannot find what they want among millions of products. Without personalization, every user sees the same generic catalog, the same trending items, the same one-size-fits-all homepage.

**35% of Amazon's revenue** comes from its recommendation engine. Netflix estimates that recommendations save **$1B per year** in customer retention by reducing churn. Recommendation quality directly impacts revenue per user by **10–30%** across industries. Yet most mid-market retailers still rely on hand-curated collections and simple popularity-based sorting.

### Choice Overload

Psychologist Barry Schwartz documented the "paradox of choice" — when users face too many options, they experience decision fatigue and are **more likely to abandon** the purchase entirely. A typical e-commerce catalog contains 100K–1M+ SKUs. Without intelligent filtering and personalization, the cognitive load on the user is overwhelming. The recommendation engine acts as a **personal shopping assistant**, narrowing millions of products to a curated set of 10–50 relevant items per page view.

>**Why This Matters:** A user who receives personalized recommendations is **4.5x more likely to add items to cart** and **2.8x more likely to complete a purchase** compared to users shown popularity-based rankings. The recommendation engine is not a nice-to-have feature — it is a core revenue driver.

### Business Impact of Personalization

| Metric | Without Recommendations | With Recommendations | Improvement |
| --- | --- | --- | --- |
| Conversion Rate | 2.1% | 5.8% | +176% |
| Average Order Value | $47 | $60 | +28% |
| Click-Through Rate | 3.2% | 14.1% | +340% |
| Session Duration | 2.4 min | 4.1 min | +71% |
| Return Visit Rate (7-day) | 18% | 34% | +89% |

These numbers compound dramatically at scale. For a retailer with 10M monthly active users, moving conversion from 2.1% to 5.8% and average order value from $47 to $60 translates to roughly **$200M+ additional annual revenue**. The investment in a recommendation engine is one of the highest-ROI ML projects an e-commerce company can undertake.

## 02. Solution Architecture

The recommendation engine uses a **GCP-native architecture** that combines collaborative filtering, content-based filtering, and real-time feature serving. BigQuery handles the heavy computation for model training and batch scoring, while Vertex AI provides low-latency online serving. The Feature Store bridges the gap between offline training and online inference.

### Architecture Diagram

![Diagram 1](/diagrams/gcp-mle-usecases/recommendation-engine-1.svg)

Figure 1 — Hybrid recommendation system combining collaborative and content-based filtering

### Data Pipeline

The data pipeline ingests three primary data sources into BigQuery. **User interactions** capture implicit feedback signals: page views, product clicks, add-to-cart events, purchases, and time-spent-on-page. **Product catalog** stores structured attributes (category, brand, price, description, tags). **Purchase history** provides the strongest signal of user preference and feeds the collaborative filtering component.

```
-- Create interaction events table in BigQuery
CREATE TABLE recommendations.interaction_events (
  event_id        STRING,
  user_id         STRING,
  product_id      STRING,
  event_type      STRING,     -- view, click, add_to_cart, purchase
  event_timestamp TIMESTAMP,
  session_id      STRING,
  device_type     STRING,
  page_dwell_ms   INT64
)
PARTITION BY DATE(event_timestamp)
CLUSTER BY user_id, product_id;

-- Product catalog table
CREATE TABLE recommendations.product_catalog (
  product_id   STRING,
  title        STRING,
  category     STRING,
  subcategory  STRING,
  brand        STRING,
  price        FLOAT64,
  description  STRING,
  tags         ARRAY<STRING>,
  created_date DATE
);
```

>**Implicit vs Explicit Feedback:** Explicit feedback (star ratings, reviews) is sparse — fewer than 1% of users rate products. Implicit feedback (clicks, views, purchases) is abundant but noisier. A view does not guarantee interest, and a non-view does not guarantee disinterest. The interaction weighting scheme must account for this: `purchase=5, add_to_cart=3, click=2, view=1`.

## 03. Technical Deep Dive

### Interaction Data Preparation

Raw interaction events must be transformed into a **user-item interaction matrix** before feeding into collaborative filtering. Each cell represents the aggregated strength of the relationship between a user and a product. We weight different event types to create an implicit rating score.

```
-- Compute weighted interaction scores
CREATE OR REPLACE TABLE recommendations.user_item_scores AS
SELECT
  user_id,
  product_id,
  SUM(CASE
    WHEN event_type = 'purchase'    THEN 5.0
    WHEN event_type = 'add_to_cart' THEN 3.0
    WHEN event_type = 'click'       THEN 2.0
    WHEN event_type = 'view'        THEN 1.0
    ELSE 0.0
  END) AS interaction_score,
  COUNT(*) AS total_events,
  MAX(event_timestamp) AS last_interaction
FROM recommendations.interaction_events
WHERE event_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY)
GROUP BY user_id, product_id
HAVING interaction_score > 0;
```

The 90-day window prevents stale preferences from dominating recommendations. Users' tastes evolve, and a purchase from two years ago may no longer be relevant. Time decay can also be applied as a continuous weighting factor rather than a hard cutoff: `score * EXP(-0.01 * days_since_event)`.

### BigQuery ML Matrix Factorization

**Matrix Factorization** decomposes the sparse user-item interaction matrix into two lower-dimensional matrices: **user factors** (U) and **item factors** (V). The predicted score for user *u* and item *i* is the dot product of their respective factor vectors: *score(u, i) = U\_u · V\_i*. This captures latent features — patterns that emerge from collective behavior without being explicitly defined.

R ≈ U × VT   where   U ∈ ℝm × k,  V ∈ ℝn × k,  k = number of latent factors

```
-- Train Matrix Factorization model in BigQuery ML
CREATE OR REPLACE MODEL recommendations.collab_filter_model
OPTIONS (
  model_type            = 'MATRIX_FACTORIZATION',
  user_col              = 'user_id',
  item_col              = 'product_id',
  rating_col            = 'interaction_score',
  feedback_type         = 'IMPLICIT',
  num_factors           = 64,
  l2_reg               = 0.1,
  wals_alpha           = 40,
  max_iterations       = 20,
  data_split_method    = 'RANDOM',
  data_split_eval_fraction = 0.2
) AS
SELECT
  user_id,
  product_id,
  interaction_score
FROM recommendations.user_item_scores;
```

>**Key Hyperparameters:** **num\_factors**: Dimensionality of the latent space (32–128 typical). Higher values capture more complex patterns but risk overfitting. **wals\_alpha**: Confidence parameter for implicit feedback — higher values place more weight on observed interactions vs. unobserved ones. **l2\_reg**: Regularization to prevent overfitting on popular items. **feedback\_type='IMPLICIT'**: Uses Weighted Alternating Least Squares (WALS) instead of standard ALS.

```
-- Generate top-10 recommendations per user
SELECT *
FROM ML.RECOMMEND(
  MODEL recommendations.collab_filter_model,
  STRUCT(10 AS top_k)
)
WHERE user_id = 'user_12345'
ORDER BY predicted_rating DESC;
```

### Content-Based Filtering with Product Embeddings

While collaborative filtering excels at finding non-obvious connections between users and items, it fails completely for **new products** with no interaction history. Content-based filtering solves this by computing similarity based on product attributes. We use **TF-IDF** on product descriptions and category features to create product embedding vectors, then recommend items similar to what a user has liked.

```
-- Generate product embeddings using BigQuery ML
CREATE OR REPLACE MODEL recommendations.product_embedding_model
OPTIONS (
  model_type = 'AUTOENCODER',
  activation_fn = 'RELU',
  hidden_units = [256, 128, 64],
  dropout = 0.2,
  l2_reg = 0.001,
  max_iterations = 50,
  learn_rate = 0.001
) AS
SELECT
  product_id,
  category,
  subcategory,
  brand,
  price,
  ML.NGRAMS(SPLIT(description, ' '), [1, 2]) AS text_features
FROM recommendations.product_catalog;
```

The autoencoder's bottleneck layer (64-dimensional) serves as the product embedding. Products with similar descriptions, categories, and price ranges will have nearby embeddings. We can then compute cosine similarity between any two products, or between a user's preference vector (average of liked product embeddings) and all candidate products.

```
-- Content-based scoring: find products similar to user's history
WITH user_profile AS (
  -- Average embeddings of products the user interacted with
  SELECT
    s.user_id,
    AVG(e.embedding_dim_1) AS profile_dim_1,
    AVG(e.embedding_dim_2) AS profile_dim_2,
    -- ... for all 64 dimensions
    AVG(e.embedding_dim_64) AS profile_dim_64
  FROM recommendations.user_item_scores s
  JOIN recommendations.product_embeddings e
    ON s.product_id = e.product_id
  WHERE s.interaction_score >= 3
  GROUP BY s.user_id
)
SELECT
  up.user_id,
  pe.product_id,
  -- Cosine similarity between user profile and product embedding
  (up.profile_dim_1 * pe.embedding_dim_1 + ... ) /
  (SQRT(up.profile_dim_1 * up.profile_dim_1 + ...) *
   SQRT(pe.embedding_dim_1 * pe.embedding_dim_1 + ...))
  AS content_score
FROM user_profile up
CROSS JOIN recommendations.product_embeddings pe
ORDER BY content_score DESC;
```

### Hybrid Recommendation Scoring

Neither collaborative filtering nor content-based filtering alone produces optimal results. Collaborative filtering captures taste patterns but suffers from cold-start. Content-based filtering works for new items but produces narrow, obvious recommendations ("you liked red shoes, here are more red shoes"). The **hybrid approach** combines both signals with a tunable weighting parameter.

hybrid\_score = α × collab\_score + (1 - α) × content\_score + β × popularity\_boost

```
-- Hybrid scoring: combine collaborative and content-based scores
CREATE OR REPLACE TABLE recommendations.hybrid_scores AS
WITH collab_scores AS (
  SELECT user_id, product_id, predicted_rating AS collab_score
  FROM ML.RECOMMEND(
    MODEL recommendations.collab_filter_model,
    STRUCT(100 AS top_k)
  )
),
content_scores AS (
  SELECT user_id, product_id, content_score
  FROM recommendations.content_based_scores
),
popularity AS (
  SELECT product_id,
    LOG(1 + COUNT(*)) AS pop_score
  FROM recommendations.interaction_events
  WHERE event_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  GROUP BY product_id
)
SELECT
  COALESCE(c.user_id, cb.user_id) AS user_id,
  COALESCE(c.product_id, cb.product_id) AS product_id,
  -- alpha = 0.6 for collaborative, 0.4 for content-based
  0.6 * COALESCE(c.collab_score, 0) +
  0.4 * COALESCE(cb.content_score, 0) +
  0.05 * COALESCE(p.pop_score, 0) AS hybrid_score
FROM collab_scores c
FULL OUTER JOIN content_scores cb
  ON c.user_id = cb.user_id AND c.product_id = cb.product_id
LEFT JOIN popularity p
  ON COALESCE(c.product_id, cb.product_id) = p.product_id
ORDER BY user_id, hybrid_score DESC;
```

>**Tuning Alpha:** The **α parameter** (collaborative weight) should be tuned via A/B testing. Typically, α = 0.6–0.7 works well for established users with rich interaction histories. For newer users or sparse catalogs, lower α (0.3–0.4) gives more weight to content-based signals. The popularity boost (β) should be small (0.02–0.1) to avoid recommending only trending items.

## 04. Cold-Start Handling

The cold-start problem is the Achilles heel of collaborative filtering. A brand-new user with zero interactions has no factor vector, making it impossible to compute collaborative scores. Similarly, a newly added product has no interaction history. Robust recommendation systems must employ fallback strategies for both scenarios.

### New User Strategies

For users with **fewer than 5 interactions**, collaborative filtering is unreliable. The system cascades through a hierarchy of fallback strategies, progressively using richer signals as they become available:

-   **0 interactions:** Show global popularity rankings segmented by demographic cohort (age bracket, location, device type)
-   **1–2 interactions:** Use content-based filtering on the viewed/clicked products. Recommend similar items from the same category/brand
-   **3–5 interactions:** Blend content-based with a lightweight nearest-neighbor collaborative approach (find the 50 most similar users based on overlapping interactions)
-   **5+ interactions:** Full hybrid scoring with matrix factorization

```
-- Cold-start routing logic
SELECT
  user_id,
  interaction_count,
  CASE
    WHEN interaction_count = 0
      THEN 'popularity_cohort'
    WHEN interaction_count BETWEEN 1 AND 2
      THEN 'content_only'
    WHEN interaction_count BETWEEN 3 AND 5
      THEN 'content_plus_knn'
    ELSE 'full_hybrid'
  END AS recommendation_strategy
FROM (
  SELECT user_id, COUNT(*) AS interaction_count
  FROM recommendations.interaction_events
  GROUP BY user_id
);
```

### New Product Strategies

New products face an analogous cold-start problem. Without interaction data, the collaborative filter cannot recommend them. We use content-based similarity to **bootstrap new products** into the recommendation pool:

(1) Compute the new product's embedding from its catalog attributes. (2) Find the 20 most similar existing products by cosine similarity. (3) Inherit a weighted average of those products' collaborative scores. (4) Apply an **exploration bonus** of 10–20% to ensure new products get exposure. This bonus decays linearly over the first 7 days as real interaction data accumulates.

>**Exploration vs. Exploitation:** New product promotion must balance exploration (giving new items a fair chance) with exploitation (showing proven high-quality items). An overly aggressive exploration bonus degrades user experience; an insufficient one creates a "rich get richer" dynamic where established products dominate permanently. The epsilon-greedy approach — showing a random new product in 10–15% of recommendation slots — is a practical compromise.

## 05. Feature Store for Real-Time Context

Batch recommendations generated in BigQuery are essential for homepage and email personalization, but product pages and search results require **real-time recommendations** that account for the user's current session context. Vertex AI Feature Store bridges this gap by serving precomputed user features with sub-10ms latency.

### Real-Time User Context

The Feature Store maintains a continuously updated profile for each user, including:

| Feature | Type | Update Frequency | Purpose |
| --- | --- | --- | --- |
| `user_embedding_64d` | FLOAT\[64\] | Daily (batch) | Collaborative filter user factor vector |
| `recent_categories` | STRING\[\] | Real-time (streaming) | Last 10 product categories viewed in session |
| `avg_price_range` | FLOAT | Hourly | Price sensitivity for score re-ranking |
| `purchase_count_30d` | INT | Daily | Engagement tier for recommendation depth |
| `cold_start_flag` | BOOL | Real-time | Route to appropriate strategy |
| `session_click_ids` | STRING\[\] | Real-time (streaming) | Current session context for re-ranking |

```
# Python: Serve features from Vertex AI Feature Store
from google.cloud import aiplatform

# Initialize Feature Store
fs = aiplatform.Featurestore(featurestore_name="recommendation_features")

# Serve real-time features for a user
entity_type = fs.get_entity_type("user")
user_features = entity_type.read(
    entity_ids=["user_12345"],
    feature_ids=[
        "user_embedding_64d",
        "recent_categories",
        "avg_price_range",
        "cold_start_flag",
    ],
)

# Use features to score candidates in real-time
if user_features["cold_start_flag"]:
    candidates = get_cold_start_candidates(user_features)
else:
    candidates = get_hybrid_candidates(user_features)
```

>**Feature Store Best Practices:** (1) Use **streaming ingestion** for session-level features (clicks, views) to ensure sub-minute freshness. (2) Use **batch ingestion** for computationally expensive features (embeddings, aggregated scores) updated daily. (3) Set **TTL (time-to-live)** on volatile features to prevent stale data from being served. (4) Monitor **feature staleness** metrics in Cloud Monitoring.

## 06. A/B Testing Recommendations

Offline evaluation metrics (NDCG, Precision@K) provide directional guidance, but they do not capture the full picture. Users may click on recommended items without purchasing, or recommendations may cannibalize organic search traffic. **A/B testing** is the gold standard for measuring the true business impact of recommendation changes.

### Experiment Design

Each experiment compares a **control** (current production model) against one or more **treatment** variants. Users are randomly assigned to groups using a deterministic hash of their user ID, ensuring stable assignment across sessions. Key design principles:

-   **Minimum sample size:** Calculate required sample per variant using power analysis (typically 10K–50K users for a 5% MDE on conversion)
-   **Duration:** Run for at least 2 full business cycles (14+ days) to capture weekday/weekend variation
-   **Primary metric:** Revenue per user (combines CTR, conversion, and AOV into a single north-star metric)
-   **Guardrail metrics:** Session bounce rate, page load time, catalog coverage (% of products ever recommended)

```
-- A/B test assignment and results tracking
CREATE OR REPLACE TABLE recommendations.ab_test_results AS
SELECT
  user_id,
  CASE
    WHEN MOD(ABS(FARM_FINGERPRINT(user_id)), 100) < 50
      THEN 'control'
    ELSE 'treatment_hybrid_v2'
  END AS experiment_group,
  COUNTIF(event_type = 'click') AS clicks,
  COUNTIF(event_type = 'purchase') AS purchases,
  SUM(IF(event_type = 'purchase', revenue, 0)) AS total_revenue,
  COUNT(DISTINCT session_id) AS sessions
FROM recommendations.interaction_events
WHERE event_timestamp BETWEEN
  '2025-01-01' AND '2025-01-15'
GROUP BY user_id;

-- Compute statistical significance
SELECT
  experiment_group,
  COUNT(*) AS num_users,
  AVG(total_revenue) AS avg_revenue_per_user,
  STDDEV(total_revenue) AS stddev_revenue,
  AVG(purchases) / AVG(sessions) AS conversion_rate,
  AVG(clicks) / AVG(sessions) AS ctr
FROM recommendations.ab_test_results
GROUP BY experiment_group;
```

## 07. Diversity & Serendipity

A recommendation list consisting entirely of the highest-scoring items often produces a **homogeneous** set — all items from the same category, brand, or price range. While individually optimal, such a list is collectively suboptimal because it fails to cover the user's diverse interests and provides no opportunity for discovery.

**Diversity** measures how dissimilar the recommended items are from each other. **Serendipity** measures how surprising the recommendations are — items the user would not have found on their own but will enjoy. Both are essential for long-term engagement and user satisfaction.

We implement a **Maximal Marginal Relevance (MMR)** re-ranking step that iteratively selects items balancing relevance against redundancy:

MMR(i) = λ × score(i) - (1 - λ) × maxj ∈ S similarity(i, j)

```
# Python: MMR re-ranking for diversity
import numpy as np

def mmr_rerank(scores, embeddings, lambda_param=0.7, top_k=10):
    """Re-rank candidates using Maximal Marginal Relevance."""
    selected = []
    candidates = list(range(len(scores)))

    for _ in range(top_k):
        mmr_scores = []
        for idx in candidates:
            relevance = scores[idx]
            if selected:
                max_sim = max(
                    cosine_similarity(embeddings[idx], embeddings[s])
                    for s in selected
                )
            else:
                max_sim = 0
            mmr = lambda_param * relevance - (1 - lambda_param) * max_sim
            mmr_scores.append((idx, mmr))

        best_idx = max(mmr_scores, key=lambda x: x[1])[0]
        selected.append(best_idx)
        candidates.remove(best_idx)

    return selected
```

>**Category Slot Allocation:** A complementary strategy is **slot-based allocation**: reserve specific positions in the recommendation carousel for different categories. For example, in a 10-item carousel: positions 1–4 from the user's primary interest, positions 5–7 from secondary interests, position 8 for a trending item, position 9 for a new product (exploration), and position 10 for a cross-category "surprise" recommendation.

## 08. Key Components

📊

#### BigQuery ML

Train matrix factorization models directly in BigQuery using SQL. No data movement, no separate training infrastructure. Handles implicit feedback with WALS algorithm and scales to billions of interactions.

🔬

#### Matrix Factorization

Decomposes the user-item interaction matrix into latent factor vectors. Captures hidden taste patterns: users who buy X also buy Y. The core collaborative filtering technique behind Netflix Prize and similar systems.

🗃

#### Feature Store

Vertex AI Feature Store provides low-latency serving of user features for real-time recommendation scoring. Bridges batch-trained models with online inference. Supports both streaming and batch ingestion.

🚀

#### Vertex AI Endpoints

Deploy the hybrid scoring model as a managed REST endpoint with autoscaling, traffic splitting for A/B tests, and sub-50ms latency SLOs. Supports canary deployments for safe model rollouts.

📄

#### Content-Based Filtering

Uses product attributes (description, category, brand, tags) to compute item similarity. Essential for cold-start scenarios where no interaction data exists. TF-IDF, autoencoders, or pre-trained language model embeddings.

⚖️

#### A/B Testing

Randomized controlled experiments to measure the true business impact of recommendation model changes. Deterministic user assignment via hashed IDs. Statistical significance testing with revenue per user as the primary metric.

## 09. Results

The hybrid recommendation engine was evaluated in a 30-day A/B test with 250K users per group. The treatment group received personalized hybrid recommendations; the control group saw popularity-based rankings. All differences are statistically significant at p < 0.001.

📈

#### +340% Click-Through Rate

CTR increased from 3.2% to 14.1% on recommendation carousels. Users engage with personalized suggestions far more than generic popularity lists.

💰

#### +28% Average Order Value

AOV rose from $47 to $60. Cross-category recommendations (e.g., recommending accessories alongside electronics) drove meaningful basket size increases.

🎯

#### 2.1% to 5.8% Conversion

Conversion rate nearly tripled. Personalized product discovery reduces friction and decision fatigue, turning browsers into buyers.

📉

#### NDCG@10 of 0.42

Normalized Discounted Cumulative Gain at rank 10 reached 0.42 (vs 0.18 for the popularity baseline). The model ranks relevant items significantly higher.

>**Cold-Start Coverage:** **78% of new users** received personalized recommendations within their first 3 sessions, thanks to the content-based fallback and session-level feature streaming. The remaining 22% (users with single-page-view sessions) received cohort-based popularity rankings that still outperformed the global popularity baseline by 15%.

### Offline Evaluation Metrics

| Metric | Popularity Baseline | Collaborative Only | Content Only | Hybrid |
| --- | --- | --- | --- | --- |
| Precision@10 | 0.08 | 0.21 | 0.14 | **0.26** |
| Recall@10 | 0.03 | 0.12 | 0.09 | **0.15** |
| NDCG@10 | 0.18 | 0.35 | 0.24 | **0.42** |
| Catalog Coverage | 4% | 31% | 52% | **58%** |
| Intra-List Diversity | 0.22 | 0.35 | 0.48 | **0.54** |

## 10. Production Considerations

Deploying a recommendation engine in production surfaces challenges that do not appear in offline experimentation. The system must handle millions of concurrent users, respond in under 50ms, refresh models without downtime, and avoid reinforcing harmful biases.

### Popularity Bias

Collaborative filtering inherently favors items with many interactions, creating a **"rich get richer"** feedback loop. Popular items get recommended more, generating more interactions, further boosting their scores. Counter-measures include: (1) logarithmic dampening of popularity scores, (2) inverse-propensity weighting in the training loss, (3) dedicated exploration slots for long-tail products.

### Filter Bubbles

Over-personalization creates filter bubbles where users only see items similar to their past behavior, never discovering new categories or emerging trends. The MMR re-ranking and slot allocation strategies described in Section 7 mitigate this. Additionally, periodic "exploration bursts" — days where the serendipity parameter is temporarily increased — help expand the user's taste profile.

### Serving Latency

The p99 latency target for recommendation serving is **<50ms**. This requires: (1) precomputed candidate lists cached in Cloud Memorystore (Redis), (2) lightweight real-time re-ranking (only top 100 candidates, not the full catalog), (3) Feature Store lookups colocated in the same region as the serving endpoint, (4) model quantization for the scoring function.

### Model Freshness

The matrix factorization model is retrained **daily** via a scheduled BigQuery ML job. Content embeddings are updated **weekly** (product catalog changes slowly). Real-time session features are streamed to Feature Store **within seconds** via Pub/Sub. The hybrid scorer uses the freshest available signals at inference time. A stale model guard monitors training recency and alerts if the model is more than 36 hours old.

### Fairness

Recommendation systems must not discriminate based on user demographics. A model that systematically recommends cheaper products to users from certain zip codes, or that under-represents products from minority-owned brands, creates both ethical and legal liability. Regular fairness audits compare recommendation quality (NDCG, coverage) across demographic slices. The Vertex AI Model Evaluation toolkit provides built-in fairness indicators.

### Privacy

User interaction data is sensitive. Production considerations include: (1) data minimization — only retain the last 90 days of interactions, (2) pseudonymization of user IDs, (3) differential privacy in the training process (adding calibrated noise to gradients), (4) on-device inference for the most privacy-sensitive use cases (federated learning approaches where the model trains on user data without it leaving the device).

### Scalability

The system must scale to millions of users and products. Key architectural decisions: (1) use **approximate nearest neighbor (ANN)** search (ScaNN or Vertex AI Matching Engine) instead of brute-force similarity computation, (2) shard the recommendation cache by user ID hash, (3) use batch prediction for email/push notification recommendations (no latency requirement), reserving real-time serving for web/app requests only, (4) auto-scale Vertex AI endpoints based on QPS (queries per second) with a 2x headroom buffer for traffic spikes.

>**Production Checklist:** Before launching: (1) Load test at 3x expected peak QPS. (2) Set up model monitoring for prediction drift. (3) Implement a global fallback (popularity-based) that activates if the model endpoint is unhealthy. (4) Verify GDPR/CCPA compliance for all stored interaction data. (5) Document the recommendation logic for regulatory transparency.

## 🛠️. Build Your Portfolio

### Fork & Extend

Turn this notebook into a portfolio project in 5 steps:

1.  **Fork the notebook** — Clone the repo and open in Google Colab or locally.
2.  **Swap in real data** — Replace the synthetic dataset with the **Amazon Product Reviews** dataset (233M reviews across 29 product categories with star ratings, review text, and metadata). Download it at [cseweb.ucsd.edu/~jmcauley/datasets/amazon\_v2/](https://cseweb.ucsd.edu/~jmcauley/datasets/amazon_v2/).
3.  **Add a two-tower neural retrieval model** — Implement a TensorFlow Recommenders (TFRS) two-tower model with separate user and item embedding towers. Show how neural collaborative filtering outperforms matrix factorization on cold-start users by incorporating user metadata (signup recency, browse category distribution).
4.  **Deploy it** — Wrap it in a Streamlit app with a user profile panel, a "Recommended For You" carousel, a "Because You Bought X" section, and real-time filtering by category and price range.
5.  **Write a README** — Include architecture diagram, setup instructions, sample outputs, and metrics.

### What Hiring Managers Look For

>**Pro Tip:** Recommendation engine portfolios impress when they demonstrate **offline-to-online evaluation awareness**. Show offline metrics (Precision@K, NDCG@K, MAP) but explain why they do not always correlate with online metrics (CTR, conversion rate, revenue per session). Include a cold-start strategy that gracefully degrades from personalized recommendations to popularity-based or content-based fallbacks for new users. Bonus: implement a diversity metric (intra-list diversity or coverage) and show the trade-off between relevance and catalog exploration.

### Public Datasets to Use

-   **Amazon Product Reviews (2018)** — 233M reviews across 29 categories with star ratings, review text, product metadata, and "also bought" links. Available at UCSD. The most comprehensive e-commerce recommendation dataset available.
-   **MovieLens 25M** — 25M ratings from 162K users on 62K movies with tag annotations and genome scores. Available at grouplens.org. The classic benchmark for collaborative filtering research with rich metadata.
-   **H&M Personalized Fashion Recommendations** — 31M purchase records from 1.3M customers across 105K fashion articles with product images and descriptions. Available on Kaggle. Excellent for multimodal recommendations combining visual and behavioral signals.

### Deployment Options

| Platform | Best For | Effort |
| --- | --- | --- |
| Streamlit | Interactive recommendation explorer with user profiles, product carousels, and A/B test results | Low |
| Gradio | Quick demo where users select liked products and see personalized recommendations update in real time | Low |
| FastAPI | Recommendation API returning top-K items with scores, supporting candidate retrieval and re-ranking stages | Medium |
| Docker + Cloud Run | Production recommendation service with feature store integration, model versioning, and sub-100ms latency | High |

Previous

[← 04 · Defect Detection](04-defect-detection.html)

All Use Cases

[Use Cases Hub →](index.html)