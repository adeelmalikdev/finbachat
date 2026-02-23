export function getSafeErrorMessage(error: any): string {
  const errorCode = error?.code;
  const errorMessage = error?.message?.toLowerCase() || '';

  if (errorCode === '23505') return 'This item already exists.';
  if (errorCode === '23503') return 'Cannot complete this action due to related data.';
  if (errorMessage.includes('row-level security')) return 'You do not have permission to perform this action.';
  if (errorMessage.includes('not-null')) return 'Required information is missing.';
  if (errorMessage.includes('foreign key')) return 'Cannot complete this action due to related data.';
  if (errorMessage.includes('invalid login')) return 'Invalid email or password.';
  if (errorMessage.includes('email not confirmed')) return 'Please confirm your email before signing in.';
  if (errorMessage.includes('user already registered')) return 'An account with this email already exists.';
  if (errorMessage.includes('password')) return 'Please check your password and try again.';
  if (errorMessage.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.';

  return 'An error occurred. Please try again.';
}
