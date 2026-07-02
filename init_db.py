import sqlite3

conn = sqlite3.connect("employees.db")

cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS employees (
    employee_id TEXT PRIMARY KEY,
    name TEXT,
    department TEXT,
    email TEXT,
    manager TEXT,
    leave_balance INTEGER,
    location TEXT
)
""")

employees = [
    ("EMP101", "Rahul Sharma", "HR", "rahul@pisystems.in", "Priya Nair", 12, "Chennai"),
    ("EMP102", "Ananya Kumar", "Development", "ananya@pisystems.in", "Arun Raj", 8, "Chennai"),
    ("EMP103", "Karthik S", "Testing", "karthik@pisystems.in", "Deepa Menon", 15, "Bangalore"),
    ("EMP104", "Sneha R", "Finance", "sneha@pisystems.in", "Vijay Kumar", 10, "Hyderabad"),
    ("EMP105", "Mohammed Ali", "Support", "ali@pisystems.in", "Priya Nair", 6, "Chennai")
]

cursor.executemany("""
INSERT OR REPLACE INTO employees
VALUES (?, ?, ?, ?, ?, ?, ?)
""", employees)

conn.commit()

print("Database created successfully!")

conn.close()