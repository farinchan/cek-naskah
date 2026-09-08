import { account } from '~/utils/appwrite.js'

export interface PointTransaction {
  id: string
  userId: string
  userEmail: string
  userName?: string
  adminId?: string
  adminName?: string
  adminEmail?: string
  type: 'topup' | 'deduction' | 'adjustment'
  amount: number
  balanceBefore: number
  balanceAfter: number
  notes: string
  createdAt: string
}

export const POINT_RATE = 1 // 1 Poin = Rp 1

export const usePoints = () => {
  const { user, userPoints } = useAuth()
  const isTopupModalOpen = useState<boolean>('point_topup_modal_open', () => false)
  const historyLoading = ref(false)
  const historyList = ref<PointTransaction[]>([])

  const openTopupModal = () => {
    isTopupModalOpen.value = true
  }

  const closeTopupModal = () => {
    isTopupModalOpen.value = false
  }

  // Reactive list of point history from current logged-in user prefs
  const userPointHistory = computed<PointTransaction[]>(() => {
    const raw = user.value?.prefs?.pointHistory
    if (Array.isArray(raw)) {
      return raw as PointTransaction[]
    }
    return []
  })

  // Fetch history via API with fallback to user prefs
  const fetchHistory = async () => {
    historyLoading.value = true
    try {
      const { jwt } = await account.createJWT()
      const res = await $fetch<{ success: boolean, history: PointTransaction[] }>('/api/points/history', {
        headers: { 'x-appwrite-jwt': jwt }
      })
      if (res.success && Array.isArray(res.history)) {
        historyList.value = res.history
        return res.history
      }
    } catch {
      const raw = user.value?.prefs?.pointHistory
      if (Array.isArray(raw)) {
        historyList.value = raw as PointTransaction[]
      }
    } finally {
      historyLoading.value = false
    }
    return historyList.value
  }

  // Format point integer to readable Indonesian format: e.g. "15.000 Poin"
  const formatPoints = (points: number): string => {
    const val = typeof points === 'number' && !isNaN(points) ? points : 0
    return `${val.toLocaleString('id-ID')} Poin`
  }

  // Convert points to equivalent Rupiah: e.g. 15.000 points -> Rp 15.000
  const pointsToRupiah = (points: number): number => {
    const val = typeof points === 'number' && !isNaN(points) ? points : 0
    return val * POINT_RATE
  }

  // Format points to Rupiah string: e.g. 15.000 points -> "Rp 15.000"
  const formatPointsAsRupiah = (points: number): string => {
    const rupiah = pointsToRupiah(points)
    return `Rp ${rupiah.toLocaleString('id-ID')}`
  }

  // Extract Rupiah from string and convert to point equivalent: e.g. "Rp 15.000" -> 15000 Poin
  const rupiahToPoints = (rupiahVal: string | number): number => {
    if (typeof rupiahVal === 'number') {
      return Math.max(0, Math.round(rupiahVal / POINT_RATE))
    }
    const cleanStr = String(rupiahVal).replace(/[^0-9]/g, '')
    const num = parseInt(cleanStr, 10)
    if (isNaN(num) || num <= 0) return 0
    return Math.max(0, Math.round(num / POINT_RATE))
  }

  // Format price string to points display: e.g. "Rp 15.000" -> "15.000 Poin", "Mulai Rp 35.000" -> "Mulai 35.000 Poin"
  const formatPriceToPoints = (priceStr: string): string => {
    if (!priceStr) return '0 Poin'
    const isPrefixMulai = priceStr.toLowerCase().includes('mulai')
    const pts = rupiahToPoints(priceStr)
    if (pts <= 0) return '0 Poin'
    return `${isPrefixMulai ? 'Mulai ' : ''}${pts.toLocaleString('id-ID')} Poin`
  }

  // Format transaction type to Indonesian label
  const formatTransactionType = (type: string): string => {
    switch (type) {
      case 'topup':
        return 'Top Up Saldo'
      case 'deduction':
        return 'Pengurangan Saldo'
      case 'adjustment':
        return 'Penyesuaian Saldo'
      default:
        return 'Transaksi Poin'
    }
  }

  // Format ISO date to Indonesian readable format
  const formatTransactionDate = (dateStr: string): string => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  return {
    POINT_RATE,
    user,
    userPoints,
    userPointHistory,
    isTopupModalOpen,
    openTopupModal,
    closeTopupModal,
    formatPoints,
    pointsToRupiah,
    formatPointsAsRupiah,
    rupiahToPoints,
    formatPriceToPoints,
    formatTransactionType,
    formatTransactionDate,
    historyLoading,
    historyList,
    fetchHistory
  }
}
