export function openTerminalPopup(sessionId?: string): void {
  const url = new URL('/webTerminalPopup', window.location.origin)
  if (sessionId) url.searchParams.set('sessionId', sessionId)

  const popup = window.open(
    url.toString(),
    '_blank',
    'width=900,height=420,menubar=no,toolbar=no,status=no,resizable=no'
  )

  popup?.focus()
}
