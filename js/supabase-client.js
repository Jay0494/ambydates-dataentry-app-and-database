// ---- Supabase project connection ----
const SUPABASE_URL = 'https://deecwfsjeuswpirjnckx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZWN3ZnNqZXVzd3BpcmpuY2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MzA0NzMsImV4cCI6MjEwMjIwNjQ3M30.hvYLRfmv2W3lX93iZ4xmCyqf-TnrWRrsCAjh5JroH3g';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ---- Table names ----
const CUST_TABLE = 'dimcustomer';
const PROD_TABLE = 'dimproduct';
const SALES_TABLE = 'factsales';