import { IsDate, IsEmail, IsInt, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClientDTO {
    @IsInt()
    internalId: number;

    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsDate()
    @Transform(({ value }) => new Date(value))
    date: Date;
}
