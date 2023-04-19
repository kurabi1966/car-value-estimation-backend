import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Report } from './report.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { NotFoundError } from 'rxjs';
import { GetEstimateDto, GetReportsDto } from './dtos/reports.dto';

@Injectable()
export class ReportsService {
  private logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async create(attrs: Partial<Report>, user: User) {
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`createReport by ${user.id}`);
    const report = this.reportRepository.create(attrs);
    report.user = user;
    return await this.reportRepository.save(report);
  }

  async changeApproval(id: number, approved: boolean) {
    // 1. find the report
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    // If not exist thow an error
    if (!report) {
      throw new NotFoundException(`Report with id ${id} not found`);
    }
    // 2. update the approved field to true
    if (report.approved === approved) {
      return report;
    }
    report.approved = approved;
    return this.reportRepository.save(report);
  }

  async createEstimate(query: GetEstimateDto) {
    process.env.NODE_ENV === 'development' &&
      this.logger.debug(`createEstimate`);
    const { make, model, year, mileage, lng, lat } = query;
    return await this.reportRepository
      .createQueryBuilder()
      .select('ROUND(AVG(price))', 'average-price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -2 AND 2', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }

  async getReports(query: GetReportsDto) {
    const { make, model, year, lng, lat, approved } = query;
    let where = year ? 'year = :year' : 'year > 1929';
    where += make ? ' AND make = :make' : '';
    where += model ? ' AND model = :model' : '';
    where += lng ? ' AND lng - :lng BETWEEN -5 AND 5' : '';
    where += lat ? ' AND lat - :lat BETWEEN -5 AND 5' : '';
    where += approved === 'yes' ? ' AND approved IS TRUE' : '';
    where += approved === 'no' ? ' AND approved IS FALSE' : '';
    const whereParams = {};

    make ? (whereParams['make'] = make) : null;
    model ? (whereParams['model'] = model) : null;
    lng ? (whereParams['lng'] = lng) : null;
    lat ? (whereParams['lat'] = lat) : null;
    year ? (whereParams['year'] = year) : null;

    return await this.reportRepository
      .createQueryBuilder()
      .select('*')
      .where(where, whereParams)
      .getRawMany();
  }
}
