const fs = require('fs')
const { PDFDocument } = require('pdf-lib')

;(async () => {
  const formUrl = 'src/template.pdf'
  if (!fs.existsSync(formUrl)) {
    console.error('Template not found at', formUrl)
    process.exit(1)
  }

  const pdfBytes = fs.readFileSync(formUrl)
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const form = pdfDoc.getForm()

  const fields = form.getFields()

  const summary = fields.map((field) => {
    const name = field.getName()
    const type = field.constructor.name
    let widgetCount = 0
    let rects = []
    try {
      const widgets = field.acroField.getWidgets()
      widgetCount = widgets.length
      rects = widgets.map((w) => {
        try {
          const rect = w.getRectangle()
          // rect: { x, y, width, height }
          return rect
        } catch (e) {
          return null
        }
      })
    } catch (e) {
      // ignore
    }

    return { name, type, widgetCount, rects }
  })

  const byName = summary.reduce((acc, f) => {
    acc[f.name] = acc[f.name] || []
    acc[f.name].push(f)
    return acc
  }, {})

  const duplicates = Object.entries(byName)
    .filter(([_, arr]) => arr.length > 1 || arr[0].widgetCount > 1)
    .map(([name, arr]) => ({ name, entries: arr }))

  console.log('Total fields:', fields.length)
  if (duplicates.length) {
    console.log('Fields with duplicate names or multiple widgets:')
    duplicates.forEach((d) => {
      const totalWidgets = d.entries.reduce((s, e) => s + e.widgetCount, 0)
      console.log(`- ${d.name} (instances: ${d.entries.length}, widgets: ${totalWidgets})`)
    })
  } else {
    console.log('No duplicate field names detected.')
  }

  console.log('\nAll fields:')
  summary.forEach((f) => {
    console.log(`${f.name}\t${f.type}\twidgets=${f.widgetCount}`)
  })
})().catch((err) => {
  console.error(err)
  process.exit(1)
})
