import {
  Body,
  Controller,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApproveReportDto,
  CreateReportDto,
  GetEstimateDto,
  GetReportsDto,
  ReportDto,
} from './dtos/reports.dto';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { AdminGuard } from 'src/guards/admin.guard';

@Controller('reports')
export class ReportsController {
  private logger = new Logger(ReportsController.name);
  constructor(private readonly reportService: ReportsService) {}

  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  @Post()
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`createReport by ${user.id}`);
    return this.reportService.create(body, user);
  }

  @UseGuards(AdminGuard)
  @Serialize(ReportDto)
  @Patch('/:id')
  approveReport(@Param('id') id: string, @Body() body: ApproveReportDto) {
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`approve report ${id}`);
    return this.reportService.changeApproval(parseInt(id), body.approved);
  }

  @UseGuards(AdminGuard)
  @Serialize(ReportDto)
  @Get('')
  getReports(@Query() query: GetReportsDto) {
    process.env.NODE_ENV === 'development' && this.logger.debug(`getReports`);
    return this.reportService.getReports(query);
  }

  @Get('/estimate')
  getEstimate(@Query() query: GetEstimateDto) {
    process.env.NODE_ENV === 'development' && this.logger.debug(`getEstimate`);

    return this.reportService.createEstimate(query);
  }
}
