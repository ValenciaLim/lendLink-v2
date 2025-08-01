import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Create a figure and axis
fig, ax = plt.subplots(figsize=(16, 10))
ax.set_xlim(0, 10)
ax.set_ylim(0, 10)
ax.axis('off')

# Draw boxes (nodes)
boxes = {
    'User': (1, 9),
    'Deposit LST\n(stETH, rETH)': (1, 7.5),
    'LendLink\n(Etherlink)': (4, 7.5),
    'Borrow USDC\n(Stablecoin)': (7, 7.5),
    'Auto-Repay\nvia Staking Yield': (4, 5.5),
    'Cross-Chain Bridge\n(1inch Fusion+)': (4, 4),
    'Borrow on Cosmos/\nNear/Aptos': (7, 4),
    'Repay from Cosmos/\nNear/Aptos': (7, 2.5),
    'LendLink Prime\n(Cross-Chain Layer)': (4, 2.5),
    'Final Repayment': (4, 1),
}

# Draw arrows (edges)
arrows = [
    ('User', 'Deposit LST\n(stETH, rETH)'),
    ('Deposit LST\n(stETH, rETH)', 'LendLink\n(Etherlink)'),
    ('LendLink\n(Etherlink)', 'Borrow USDC\n(Stablecoin)'),
    ('LendLink\n(Etherlink)', 'Auto-Repay\nvia Staking Yield'),
    ('LendLink\n(Etherlink)', 'Cross-Chain Bridge\n(1inch Fusion+)'),
    ('Cross-Chain Bridge\n(1inch Fusion+)', 'Borrow on Cosmos/\nNear/Aptos'),
    ('Borrow on Cosmos/\nNear/Aptos', 'Repay from Cosmos/\nNear/Aptos'),
    ('Repay from Cosmos/\nNear/Aptos', 'LendLink Prime\n(Cross-Chain Layer)'),
    ('LendLink Prime\n(Cross-Chain Layer)', 'Final Repayment'),
]

# Plot the boxes
for text, (x, y) in boxes.items():
    ax.add_patch(patches.FancyBboxPatch((x - 0.9, y - 0.4), 1.8, 0.8,
                                        boxstyle="round,pad=0.1", fc="lightblue", ec="black"))
    ax.text(x, y, text, ha='center', va='center', fontsize=10, weight='bold')

# Plot the arrows
for start, end in arrows:
    x_start, y_start = boxes[start]
    x_end, y_end = boxes[end]
    ax.annotate('', xy=(x_end, y_end), xytext=(x_start, y_start),
                arrowprops=dict(arrowstyle='->', lw=2, color='gray'))

plt.title("LendLink + LendLink Prime: Full Use Case Diagram", fontsize=14, weight='bold')
plt.tight_layout()
plt.show()
