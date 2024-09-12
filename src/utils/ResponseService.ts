import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiResponce } from './Api_Responce.dto';

@Injectable()
export class ResponseService {
    success(message: string = 'Request was successful', statusCode: HttpStatus = HttpStatus.OK, data: any = {}) {
        const response: ApiResponce = {
            statusCode,
            message,
            success: true
        };

        if (Object.keys(data).length > 0) {
            response.data = data;
        }

        return response;
    }

    error(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
        return {
            statusCode,
            message,
            success:false
        };
    }
}
