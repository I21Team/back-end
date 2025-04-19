-- SQL Functions for Dashboard Data Analysis

-- Function to get top performing stores
CREATE OR REPLACE FUNCTION get_top_stores(limit_num integer, weeks_ago integer)
RETURNS TABLE(
  store_id integer,
  store_name text,
  total_sales float,
  change_percentage float
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT 
      s.store_id,
      st.store_name,
      SUM(s.total_price) as sales
    FROM 
      sales_record s
      JOIN store st ON s.store_id = st.store_id
    WHERE 
      s.week >= (SELECT MAX(week) FROM sales_record) - weeks_ago
    GROUP BY 
      s.store_id, st.store_name
  ),
  prev_period AS (
    SELECT 
      s.store_id,
      SUM(s.total_price) as sales
    FROM 
      sales_record s
    WHERE 
      s.week < (SELECT MAX(week) FROM sales_record) - weeks_ago
      AND s.week >= (SELECT MAX(week) FROM sales_record) - (weeks_ago * 2)
    GROUP BY 
      s.store_id
  )
  SELECT 
    c.store_id,
    c.store_name,
    c.sales as total_sales,
    CASE 
      WHEN p.sales IS NULL OR p.sales = 0 THEN 0
      ELSE ((c.sales - p.sales) / p.sales) * 100
    END as change_percentage
  FROM 
    current_period c
    LEFT JOIN prev_period p ON c.store_id = p.store_id
  ORDER BY 
    c.sales DESC
  LIMIT limit_num;
END;
$$ LANGUAGE plpgsql;

-- Function to get top selling products
CREATE OR REPLACE FUNCTION get_top_products(limit_num integer, weeks_ago integer)
RETURNS TABLE(
  sku_id integer,
  product_name text,
  total_sales float,
  change_percentage float
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT 
      s.sku_id,
      p.product_name,
      SUM(s.total_price) as sales
    FROM 
      sales_record s
      JOIN product p ON s.sku_id = p.sku_id
    WHERE 
      s.week >= (SELECT MAX(week) FROM sales_record) - weeks_ago
    GROUP BY 
      s.sku_id, p.product_name
  ),
  prev_period AS (
    SELECT 
      s.sku_id,
      SUM(s.total_price) as sales
    FROM 
      sales_record s
    WHERE 
      s.week < (SELECT MAX(week) FROM sales_record) - weeks_ago
      AND s.week >= (SELECT MAX(week) FROM sales_record) - (weeks_ago * 2)
    GROUP BY 
      s.sku_id
  )
  SELECT 
    c.sku_id,
    c.product_name,
    c.sales as total_sales,
    CASE 
      WHEN p.sales IS NULL OR p.sales = 0 THEN 0
      ELSE ((c.sales - p.sales) / p.sales) * 100
    END as change_percentage
  FROM 
    current_period c
    LEFT JOIN prev_period p ON c.sku_id = p.sku_id
  ORDER BY 
    c.sales DESC
  LIMIT limit_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate store performance
CREATE OR REPLACE FUNCTION get_store_performance()
RETURNS TABLE(
  performance_percentage float,
  change float
) AS $$
DECLARE
  target_value float := 80.0; -- Example target percentage
  previous_value float := 70.0; -- Previous period value
BEGIN
  -- Calculate percentage of stores meeting sales targets
  SELECT 
    COUNT(CASE WHEN performance >= target_value THEN 1 END) * 100.0 / COUNT(*)
  INTO performance_percentage
  FROM (
    SELECT 
      s.store_id,
      (SUM(s.total_price) / 1000) as performance -- Normalize by 1000 for percentage calculation
    FROM 
      sales_record s
    WHERE 
      s.week >= (SELECT MAX(week) FROM sales_record) - 4
    GROUP BY 
      s.store_id
  ) as store_metrics;
  
  -- Calculate change from previous period
  change := performance_percentage - previous_value;
  
  RETURN QUERY SELECT performance_percentage, change;
END;
$$ LANGUAGE plpgsql;

-- Function to get sales distribution by location
CREATE OR REPLACE FUNCTION get_sales_distribution()
RETURNS TABLE(
  store_id integer,
  store_name text,
  lat float,
  lng float,
  total_sales float
) AS $$
BEGIN
  RETURN QUERY
  WITH location_coordinates AS (
    -- This would typically parse coordinates from the location field
    -- For demo purposes, generating some coordinates based on store_id
    SELECT 
      store_id,
      -- Generate coordinates for Algeria (approx. between 28-37°N and 2-12°E)
      28 + (store_id % 9) + random() as lat,
      2 + (store_id % 10) + random() as lng
    FROM store
  )
  SELECT 
    s.store_id,
    st.store_name,
    lc.lat,
    lc.lng,
    SUM(s.total_price) as total_sales
  FROM 
    sales_record s
    JOIN store st ON s.store_id = st.store_id
    JOIN location_coordinates lc ON st.store_id = lc.store_id
  WHERE 
    s.week >= (SELECT MAX(week) FROM sales_record) - 4
  GROUP BY 
    s.store_id, st.store_name, lc.lat, lc.lng
  ORDER BY 
    total_sales DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to generate sales predictions
CREATE OR REPLACE FUNCTION get_sales_predictions(
  product_id integer,
  store_id integer,
  prediction_weeks integer
)
RETURNS TABLE(
  week_date text,
  predicted_sales float,
  actual_sales float
) AS $$
DECLARE
  base_value float;
  growth_rate float := 0.03; -- 3% weekly growth
  seasonality_factor float := 0.1; -- 10% seasonal variation
  current_week integer;
BEGIN
  -- Get current week number
  SELECT MAX(week) INTO current_week FROM sales_record;
  
  -- Calculate base value from historical data
  SELECT 
    AVG(total_price)
  INTO base_value
  FROM 
    sales_record s
  WHERE 
    (product_id IS NULL OR s.sku_id = product_id)
    AND (store_id IS NULL OR s.store_id = store_id)
    AND s.week >= current_week - 8
    AND s.week <= current_week;
    
  -- If no data found, use default
  IF base_value IS NULL THEN
    base_value := 1000.0;
  END IF;
  
  -- Return predicted values for future weeks
  RETURN QUERY
  WITH weeks AS (
    SELECT generate_series(current_week - 2, current_week + prediction_weeks) as week_num
  ),
  actual_data AS (
    SELECT 
      week,
      AVG(total_price) as sales
    FROM 
      sales_record s
    WHERE 
      (product_id IS NULL OR s.sku_id = product_id)
      AND (store_id IS NULL OR s.store_id = store_id)
      AND week >= current_week - 2
      AND week <= current_week
    GROUP BY 
      week
  )
  SELECT 
    'Week ' || w.week_num::text as week_date,
    CASE
      WHEN w.week_num > current_week 
      THEN 
        -- Apply growth and seasonality for future predictions
        base_value * (1 + growth_rate * (w.week_num - current_week)) 
        * (1 + seasonality_factor * sin(w.week_num::float / 52 * 2 * pi()))
      ELSE 
        -- For past weeks where we don't have actual data
        base_value * (1 - growth_rate * (current_week - w.week_num))
        * (1 + seasonality_factor * sin(w.week_num::float / 52 * 2 * pi()))
    END as predicted_sales,
    a.sales as actual_sales
  FROM 
    weeks w
    LEFT JOIN actual_data a ON w.week_num = a.week
  ORDER BY 
    w.week_num;
END;
$$ LANGUAGE plpgsql;

-- Function to get product distribution
CREATE OR REPLACE FUNCTION get_product_distribution()
RETURNS TABLE(
  product_name text,
  percentage float
) AS $$
BEGIN
  RETURN QUERY
  WITH total_sales AS (
    SELECT SUM(s.total_price) as total
    FROM sales_record s
    WHERE s.week >= (SELECT MAX(week) FROM sales_record) - 4
  )
  SELECT 
    p.product_name,
    (SUM(s.total_price) / (SELECT total FROM total_sales)) * 100 as percentage
  FROM 
    sales_record s
    JOIN product p ON s.sku_id = p.sku_id
  WHERE 
    s.week >= (SELECT MAX(week) FROM sales_record) - 4
  GROUP BY 
    p.product_name
  ORDER BY 
    percentage DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending metrics
CREATE OR REPLACE FUNCTION get_trending_metrics()
RETURNS TABLE(
  trending_percentage float,
  period text
) AS $$
DECLARE
  current_value float;
  previous_value float;
  trending_percent float;
BEGIN
  -- Get current period visitor count (using sales as a proxy)
  SELECT 
    SUM(units_sold)
  INTO current_value
  FROM 
    sales_record
  WHERE 
    week >= (SELECT MAX(week) FROM sales_record) - 4;
    
  -- Get previous period visitor count
  SELECT 
    SUM(units_sold)
  INTO previous_value
  FROM 
    sales_record
  WHERE 
    week < (SELECT MAX(week) FROM sales_record) - 4
    AND week >= (SELECT MAX(week) FROM sales_record) - 8;
    
  -- Calculate trending percentage
  IF previous_value IS NULL OR previous_value = 0 THEN
    trending_percent := 0;
  ELSE
    trending_percent := ((current_value - previous_value) / previous_value) * 100;
  END IF;
  
  RETURN QUERY SELECT trending_percent, 'last 6 months';
END;
$$ LANGUAGE plpgsql;