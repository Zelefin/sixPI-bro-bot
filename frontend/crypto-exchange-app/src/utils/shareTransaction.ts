import { Transaction } from "@/utils/responseTypes"
import { formatNumber } from "@/utils/numberFormatting"

export const shareTransaction = (transaction: Transaction) => {
    const messageToShare = `
🚀 **Transaction #${transaction.id}** 🚀

🪙 ${transaction.coin_symbol} | ${formatNumber(transaction.amount, false, 8)}
💰 ${transaction.points_spent} points spent 
📥 Buy: ${formatNumber(transaction.buy_price, true, 4)} | 📤 Sell: ${
      transaction.sell_price
        ? formatNumber(transaction.sell_price, true, 4)
        : `__Est.__ ${formatNumber(transaction.estimated_sell_price ?? 0, true, 4)}`
    }
✨ Profit: ${
      transaction.profit !== null
        ? `${transaction.profit >= 0 ? "🟢" : "🔴"}${formatNumber(Math.abs(transaction.profit), true, 2)}`
        : `__Est.__ ${
            transaction.estimated_profit && transaction.estimated_profit >= 0
              ? "🟢"
              : "🔴"
          }${formatNumber(Math.abs(transaction.estimated_profit ?? 0), true, 2)}`
    }
🗓️ Opened on ${new Date(transaction.open_date).toLocaleString()}
🔒 Closed on ${
      transaction.close_date
        ? new Date(transaction.close_date).toLocaleString()
        : "—"
    }
`
    return messageToShare
}