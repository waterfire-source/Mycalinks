-- ポイントのやつとか
WITH 
-- A: 5月末以前の最新履歴
before_june_history AS (
  SELECT customer_id, result_point_amount,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY id DESC) AS rn
  FROM Customer_Point_History
  WHERE created_at < '2025-05-01'
),

-- B: 6月以降の最も早い（idが小さい）履歴
first_after_may_history AS (
  SELECT customer_id, result_point_amount, change_price,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY id ASC) AS rn
  FROM Customer_Point_History
  WHERE created_at >= '2025-05-01'
)

SELECT SUM(
  CASE
    -- 5月末以前の履歴がある → それを使う
    WHEN bh.result_point_amount IS NOT NULL THEN bh.result_point_amount
    -- 5月末以前の履歴がなく6月以降の履歴がある → その履歴からchange_priceを引いて5月末時点を推定
    WHEN famh.result_point_amount IS NOT NULL THEN famh.result_point_amount - famh.change_price
    -- どちらの履歴もない → 現在のowned_pointを使う
    ELSE c.owned_point
  END
) AS point_at_end_of_may
FROM Customer c
LEFT JOIN (
  SELECT * FROM before_june_history WHERE rn = 1
) bh ON c.id = bh.customer_id
LEFT JOIN (
  SELECT * FROM first_after_may_history WHERE rn = 1
) famh ON c.id = famh.customer_id
WHERE c.store_id = 48;