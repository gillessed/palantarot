let adminPassword: string | null = null;

export function setAdminPassword(password: string) {
  adminPassword = password;
}

export function getAdminPassword() {
  return adminPassword;
}

(window as any).setAdminPassword = setAdminPassword;
