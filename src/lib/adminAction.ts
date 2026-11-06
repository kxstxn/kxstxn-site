export async function runAdminAction(
  action: () => Promise<void>,
  onNotice: (message: string) => void,
  successMessage: string,
) {
  try {
    await action()
    onNotice(successMessage)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'save failed'
    onNotice(message)
  }
}
