import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { OptionsService } from './options.service';

@Controller('options')
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get('emotions')
  findAllEmotions() {
    return this.optionsService.findAllEmotions();
  }

  @Post('emotions')
  createEmotion(@Body('name') name: string) {
    return this.optionsService.createEmotion(name);
  }

  @Delete('emotions/:id')
  deleteEmotion(@Param('id') id: string) {
    return this.optionsService.deleteEmotion(id);
  }

  @Get('patterns')
  findAllPatterns() {
    return this.optionsService.findAllPatterns();
  }

  @Post('patterns')
  createPattern(@Body('name') name: string) {
    return this.optionsService.createPattern(name);
  }

  @Delete('patterns/:id')
  deletePattern(@Param('id') id: string) {
    return this.optionsService.deletePattern(id);
  }

  @Get('strategies')
  findAllStrategies() {
    return this.optionsService.findAllStrategies();
  }

  @Post('strategies')
  createStrategy(@Body('name') name: string) {
    return this.optionsService.createStrategy(name);
  }

  @Delete('strategies/:id')
  deleteStrategy(@Param('id') id: string) {
    return this.optionsService.deleteStrategy(id);
  }
}
