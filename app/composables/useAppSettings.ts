import type { Models } from 'appwrite'
import {
  tablesDB,
  APPWRITE_DATABASE_ID,
  APPWRITE_TABLE_SETTINGS,
  ID
} from '~/utils/appwrite.js'

export interface AppSettings {
  maintenanceMode: boolean
  allowNewRegistration: boolean
  requireEmailVerification: boolean
  supportEmail: string
  supportPhone: string
}

export const defaultSettings: AppSettings = {
  maintenanceMode: false,
  allowNewRegistration: true,
  requireEmailVerification: true,
  supportEmail: 'bantuan@cek-naskah.web.id',
  supportPhone: '+62 812-3456-7890'
}

export interface SettingRow extends Models.Row {
  key: string
  value: string
}

export type DbStatus = 'idle' | 'connected' | 'not_found' | 'permission_denied' | 'error'

export const useAppSettings = () => {
  const config = useRuntimeConfig()
  const databaseId = (config.public?.appwriteDatabaseId as string) || APPWRITE_DATABASE_ID
  const tableId = (config.public?.appwriteTableSettings as string) || APPWRITE_TABLE_SETTINGS

  const settings = useState<AppSettings>('app_settings', () => ({ ...defaultSettings }))
  const hasLoaded = useState<boolean>('app_settings_has_loaded', () => false)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const dbStatus = ref<DbStatus>('idle')
  const dbStatusMessage = ref<string>('')

  // Computed phone and email helpers for public and admin views
  const rawPhone = computed(() => settings.value.supportPhone || defaultSettings.supportPhone)
  const cleanPhone = computed(() => {
    let num = rawPhone.value.replace(/[^0-9]/g, '')
    if (num.startsWith('0')) {
      num = '62' + num.slice(1)
    }
    return num || '6281234567890'
  })
  const supportEmail = computed(() => settings.value.supportEmail || defaultSettings.supportEmail)

  const getWhatsappUrl = (text?: string): string => {
    const base = `https://wa.me/${cleanPhone.value}`
    return text ? `${base}?text=${encodeURIComponent(text)}` : base
  }

  const handleDbError = (err: unknown): string => {
    const errMsg = err && typeof err === 'object' && 'message' in err
      ? String((err as { message: unknown }).message)
      : String(err)
    const errType = err && typeof err === 'object' && 'type' in err
      ? String((err as { type: unknown }).type)
      : ''

    if (
      errType === 'database_not_found'
      || errMsg.includes('Database with the requested ID')
      || errMsg.includes('could not be found')
    ) {
      dbStatus.value = 'not_found'
      dbStatusMessage.value = `Database '${databaseId}' belum dibuat di Appwrite TablesDB.`
      return `Database '${databaseId}' tidak ditemukan di Appwrite. Silakan buat database dan table '${tableId}' terlebih dahulu.`
    }

    if (
      errType === 'collection_not_found'
      || errType === 'table_not_found'
      || errMsg.includes('Collection with the requested ID')
      || errMsg.includes('Table with the requested ID')
    ) {
      dbStatus.value = 'not_found'
      dbStatusMessage.value = `Table '${tableId}' belum dibuat di TablesDB '${databaseId}'.`
      return `Table '${tableId}' tidak ditemukan di TablesDB. Silakan buat table '${tableId}' dengan column 'key' dan 'value'.`
    }

    if (
      errType === 'user_unauthorized'
      || errType === 'general_unauthorized_scope'
      || errMsg.includes('missing scopes')
      || errMsg.includes('unauthorized')
      || errMsg.includes('Permissions')
    ) {
      dbStatus.value = 'permission_denied'
      dbStatusMessage.value = `Izin akses (Permissions) belum diatur untuk table '${tableId}'.`
      return 'Izin tabel belum diatur di Appwrite. Pastikan izin Read/Create/Update diberikan kepada Users atau label admin.'
    }

    dbStatus.value = 'error'
    dbStatusMessage.value = errMsg
    return errMsg || 'Terjadi kesalahan saat mengakses Appwrite TablesDB.'
  }

  const fetchSettings = async (force = false): Promise<AppSettings> => {
    if (hasLoaded.value && !force) {
      return settings.value
    }

    loading.value = true
    error.value = null
    try {
      const res = await tablesDB.listRows<SettingRow>({
        databaseId,
        tableId
      })

      dbStatus.value = 'connected'
      dbStatusMessage.value = `Tersambung ke Appwrite TablesDB (${databaseId}/${tableId})`
      hasLoaded.value = true

      const loaded: Partial<AppSettings> = {}
      for (const doc of res.rows) {
        const k = doc.key as keyof AppSettings
        const v = doc.value
        if (
          k === 'maintenanceMode'
          || k === 'allowNewRegistration'
          || k === 'requireEmailVerification'
        ) {
          loaded[k] = v === 'true'
        } else if (k === 'supportEmail' || k === 'supportPhone') {
          loaded[k] = String(v)
        }
      }

      settings.value = {
        ...defaultSettings,
        ...loaded
      }
      return settings.value
    } catch (err: unknown) {
      const msg = handleDbError(err)
      error.value = msg
      return settings.value
    } finally {
      loading.value = false
    }
  }

  const saveSettings = async (newSettings?: Partial<AppSettings>): Promise<{ success: boolean, message: string }> => {
    saving.value = true
    error.value = null

    if (newSettings) {
      settings.value = { ...settings.value, ...newSettings }
    }

    try {
      const res = await tablesDB.listRows<SettingRow>({
        databaseId,
        tableId
      })
      const existingRows = res.rows
      dbStatus.value = 'connected'

      const docMap = new Map<string, SettingRow>()
      for (const d of existingRows) {
        docMap.set(d.key, d)
      }

      const entries: [keyof AppSettings, string][] = [
        ['maintenanceMode', String(settings.value.maintenanceMode)],
        ['allowNewRegistration', String(settings.value.allowNewRegistration)],
        ['requireEmailVerification', String(settings.value.requireEmailVerification)],
        ['supportEmail', String(settings.value.supportEmail)],
        ['supportPhone', String(settings.value.supportPhone)]
      ]

      for (const [key, value] of entries) {
        const existing = docMap.get(key)
        if (existing) {
          if (existing.value !== value) {
            await tablesDB.updateRow({
              databaseId,
              tableId,
              rowId: existing.$id,
              data: { key, value }
            })
          }
        } else {
          await tablesDB.createRow({
            databaseId,
            tableId,
            rowId: ID.unique(),
            data: { key, value }
          })
        }
      }

      hasLoaded.value = true
      dbStatus.value = 'connected'
      dbStatusMessage.value = `Pengaturan tersimpan ke Appwrite TablesDB (${databaseId}/${tableId})`
      return {
        success: true,
        message: 'Pengaturan sistem berhasil disimpan ke Appwrite TablesDB.'
      }
    } catch (err: unknown) {
      const errorMsg = handleDbError(err)
      error.value = errorMsg
      return { success: false, message: errorMsg }
    } finally {
      saving.value = false
    }
  }

  return {
    settings,
    loading,
    saving,
    error,
    dbStatus,
    dbStatusMessage,
    databaseId,
    tableId,
    rawPhone,
    cleanPhone,
    supportEmail,
    getWhatsappUrl,
    fetchSettings,
    saveSettings
  }
}
