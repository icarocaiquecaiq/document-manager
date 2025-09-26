import { Injectable } from '@nestjs/common';
import { TAuth } from './auth-types';

@Injectable()
export class AuthService {
    addAuth(AuthData: TAuth) {
        return AuthData.name;
    }
}
