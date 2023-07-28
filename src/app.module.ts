import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';

const configModule = ConfigModule.forRoot({
  isGlobal: true,
  load: [configuration],
});

const mongooseModule = MongooseModule.forRootAsync({
  useFactory: async (configService: ConfigService) => {
    return configService.get('database.host');
  },
});

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
