import fs from 'fs'
import { previewExcel, importarEntradas, PreviewRow } from '@/app/actions/importar'

async function main() {
  const buffer = fs.readFileSync('/tmp/test-entradas.xlsx')
  const file = new File([buffer], 'test-entradas.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const formData = new FormData()
  formData.append('file', file)

  const preview = await previewExcel(formData)
  if (!preview.success) {
    console.error('Preview error:', preview.error)
    return
  }

  console.log('Preview rows:', JSON.stringify(preview.data, null, 2))

  const importResult = await importarEntradas(preview.data as PreviewRow[])
  if (!importResult.success) {
    console.error('Import error:', importResult.error)
    return
  }

  console.log('Import result:', importResult.data)
}

main().catch(console.error)
