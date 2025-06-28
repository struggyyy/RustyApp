import React from 'react';
import { ImageSourcePropType } from 'react-native';
import styled from 'styled-components/native';
import colors from '../theme/colors';

// --- TYPES ---
export interface Report {
  id: string;
  date: string;
  status: string;
  points: string;
  image: ImageSourcePropType;
}

interface ReportCardProps {
  report: Report;
  getStatusColor: (status: string) => string;
}

// --- STYLED COMPONENTS ---
const CardContainer = styled.View`
  background-color: ${colors.white};
  border-radius: 15px;
  padding: 16px;
  margin-bottom: 16px;
  flex-direction: row;
  align-items: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const ReportInfo = styled.View`
  flex: 1;
`;

interface StatusTextProps {
  color: string;
}

const ReportDate = styled.Text<StatusTextProps>`
  font-size: 18px;
  font-weight: bold;
  color: ${(props: StatusTextProps) => props.color};
  margin-bottom: 8px;
`;

const ReportStatus = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
  margin-bottom: 16px;
`;

const DetailsButton = styled.TouchableOpacity`
  background-color: ${colors.text.secondary};
  padding-vertical: 10px;
  padding-horizontal: 20px;
  border-radius: 20px;
  align-self: flex-start; /* To make button only as wide as its content */
`;

const DetailsButtonText = styled.Text`
  color: ${colors.text.light};
  font-weight: bold;
  font-size: 14px;
`;

const CarImageContainer = styled.View`
  margin-left: 16px;
  align-items: center;
`;

const CarImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 40px;
`;

const PointsText = styled.Text<StatusTextProps>`
  font-size: 14px;
  font-weight: bold;
  color: ${(props: StatusTextProps) => props.color};
  margin-top: 8px;
`;

// --- COMPONENT ---
const ReportCard: React.FC<ReportCardProps> = ({ report, getStatusColor }) => {
  const statusColor = getStatusColor(report.status);

  return (
    <CardContainer>
      <ReportInfo>
        <ReportDate color={statusColor}>{report.date}</ReportDate>
        <ReportStatus>{report.status}</ReportStatus>
        <DetailsButton>
          <DetailsButtonText>See the details</DetailsButtonText>
        </DetailsButton>
      </ReportInfo>
      <CarImageContainer>
        <CarImage source={report.image} />
        <PointsText color={statusColor}>{report.points}</PointsText>
      </CarImageContainer>
    </CardContainer>
  );
};

export default ReportCard;
