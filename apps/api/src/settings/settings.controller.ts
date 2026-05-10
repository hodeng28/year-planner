import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateFeeSettingsDto } from './dto/update-fee-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('fees')
  getFeeSettings() {
    return this.settingsService.getFeeSettings();
  }

  @Put('fees')
  updateFeeSettings(@Body() dto: UpdateFeeSettingsDto) {
    return this.settingsService.updateFeeSettings(dto);
  }
}
