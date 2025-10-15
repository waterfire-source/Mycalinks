//launch
import { BackendAPI } from '@/api/backendApi/main';
import { launchApi } from 'api-generator';
import { BackendApiAuthService } from '@/api/backendApi/auth/main';

export const POST = BackendAPI.create(launchApi, async (API, { body }) => {
  const { password, email } = body;

  const result = await BackendApiAuthService.launch(API.db, email, password);

  return result;
});
