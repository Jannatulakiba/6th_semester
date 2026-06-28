"""
Lab 11: Linear Congruential Generator (LCG)
================================================
LCG formula: X(n+1) = (a * X(n) + c) mod m
   X0 = seed
   a  = multiplier
   c  = increment
   m  = modulus
The generated random numbers between 0 and 1 are: R(n) = X(n) / m

INPUTS NEEDED (LCG cannot run without these - they fully define the
generator and there is no way to derive them otherwise):
  1. seed (X0)
  2. multiplier (a)
  3. increment (c)
  4. modulus (m)
  5. how many numbers to generate (N)

The lab text only names the technique, no parameters are given, so the
classic textbook example values are used below (these are commonly
used demonstration values in Simulation Modeling textbooks):
  X0 = 7, a = 5, c = 3, m = 16, N = 16  (full period demo with m=16)
"""

# ---------------- INPUT PARAMETERS (assumed - textbook example) ----------------
X0 = 7         # seed
a = 5          # multiplier
c = 3          # increment
m = 16         # modulus
N = 16         # number of random numbers to generate

print("=" * 55)
print("       LINEAR CONGRUENTIAL GENERATOR (LCG)")
print("=" * 55)
print(f"{'Seed (X0)':<15}: {X0}")
print(f"{'Multiplier (a)':<15}: {a}")
print(f"{'Increment (c)':<15}: {c}")
print(f"{'Modulus (m)':<15}: {m}")
print(f"{'Count (N)':<15}: {N}")
print("=" * 55)
print("FORMULA: X(n+1) = (a*X(n) + c) mod m  ;  R(n) = X(n)/m")
print("=" * 55)

print(f"{'n':<5}{'X(n)':<8}{'R(n) = X(n)/m':<16}")
print("-" * 55)

X = X0
seen = set()
results = []
for n in range(N):
    R = X / m
    print(f"{n:<5}{X:<8}{R:<16.4f}")
    results.append(R)
    seen.add(X)
    X = (a * X + c) % m

print("-" * 55)
print(f"Generated {N} pseudo-random numbers in [0,1).")
print(f"Number of DISTINCT values produced: {len(seen)} out of modulus m={m}")
if len(seen) == m:
    print("  -> This LCG achieves the FULL PERIOD (m) before repeating - good generator.")
else:
    print("  -> This LCG repeats before reaching full period m.")
print("=" * 55)
