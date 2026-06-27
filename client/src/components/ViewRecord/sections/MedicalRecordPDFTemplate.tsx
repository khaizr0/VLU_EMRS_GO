import React from "react";
import type { Record as MedicalRecord, Patient, Transfer } from "@/types";
import { XRayPaper, HematologyPaper } from "./ClinicalResultViews";

interface Props {
  record: MedicalRecord;
  patient: Patient;
  attachments?: any[];
}

export const MedicalRecordPDFTemplate: React.FC<Props> = ({ record, patient, attachments = [] }) => {
  const parseDateToParts = (dateString?: string, timeString?: string) => {
    if (!dateString) return { day: "...", month: "...", year: "....", time: timeString || "..." };
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return { day: "...", month: "...", year: "....", time: timeString || "..." };
      return {
        day: d.getDate().toString().padStart(2, "0"),
        month: (d.getMonth() + 1).toString().padStart(2, "0"),
        year: d.getFullYear().toString(),
        time: timeString || `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`,
      };
    } catch {
      return { day: "...", month: "...", year: "....", time: timeString || "..." };
    }
  };

  const adParts = parseDateToParts(record.admissionDate, record.managementData?.admissionTime);
  const disParts = parseDateToParts(record.dischargeDate, record.managementData?.dischargeTime);
  
  const mData = record.managementData || { transfers: [] };
  const totalDays = mData.totalDays || 0;
  const cData = record.medicalRecordContent || {};
  const dInfo = record.diagnosisInfo || {};
  const dsInfo = record.dischargeStatusInfo || {};

  const pageStyle: React.CSSProperties = {
    width: "210mm",
    minHeight: "297mm",
    padding: "10mm 15mm",
    backgroundColor: "white",
    color: "black",
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: "10.5pt",
    lineHeight: "1.3",
    boxSizing: "border-box",
    position: "relative",
    pageBreakAfter: "always",
  };

  const cellStyle: React.CSSProperties = {
    border: "1px solid black",
    padding: "2px 4px",
    verticalAlign: "top",
  };

  const boxStyle: React.CSSProperties = {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "1px solid black",
    textAlign: "center",
    lineHeight: "12px",
    fontSize: "12px",
    verticalAlign: "middle",
    marginLeft: "5px",
    fontWeight: "normal"
  };

  const getGenderCheck = (g: string | number) => {
    if (g === 1 || g === "Nam") return [true, false];
    if (g === 2 || g === "Nữ") return [false, true];
    return [false, false];
  };
  const [isMale, isFemale] = getGenderCheck(patient.gender);

  const renderTransferRow = (transfer?: Transfer) => {
    return (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ width: "90px", color: transfer ? "black" : "transparent" }}>16. Chuyển Khoa:</span>
            <div style={{ border: "1px solid black", padding: "0 5px", width: "80px", height: "18px", textAlign: "center", overflow: "hidden", marginRight: "10px" }}>{transfer?.department}</div>
            <span style={{ flex: 1, textAlign: "center", color: transfer ? "black" : "#666", fontSize: "7.5pt" }}>
                {transfer ? `${transfer.time || "..."} ${transfer.date ? new Date(transfer.date).toLocaleDateString('vi-VN') : "..."}` : "........................................"}
            </span>
            <div style={{ border: "1px solid black", padding: "0 5px", width: "40px", height: "18px", textAlign: "center", marginLeft: "10px" }}>{transfer?.days}</div>
        </div>
    );
  };

  return (
    <div className="pdf-container">
      {/* PAGE 1 */}
      <div style={pageStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <div style={{ width: "45%" }}>
            <div style={{ fontSize: "8pt", textTransform: "uppercase", fontWeight: "bold" }}>SỞ Y TẾ: {record.healthDept || "........................................"}</div>
            <div style={{ fontWeight: "bold", fontSize: "8pt", textTransform: "uppercase" }}>BỆNH VIỆN: {record.hospital || "................................."}</div>
            <div style={{ fontSize: "10pt" }}>Khoa: {record.department} <span style={{marginLeft: "20px"}}>Giường: {record.bedCode || "........."}</span></div>
          </div>
          <div style={{ width: "35%", textAlign: "right", fontSize: "9pt" }}>
            <div style={{fontWeight: "bold"}}>MS: 01/BV-01</div>
            <div>Số lưu trữ: {record.storageCode || record.numericId}</div>
            <div>Mã YT: ..............................</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <h1 style={{ fontSize: "16pt", fontWeight: "bold", margin: "5px 0" }}>BỆNH ÁN NỘI KHOA</h1>
        </div>

        {/* I. HÀNH CHÍNH */}
        <div style={{ fontWeight: "bold", marginBottom: "3px" }}>I. HÀNH CHÍNH:</div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", border: "none", fontSize: "10pt" }}>
          <tbody>
            <tr>
              <td style={{ width: "60%", paddingBottom: "3px" }}>
                1. Họ và tên (In hoa): <b style={{ textTransform: "uppercase" }}>{patient.name}</b>
              </td>
              <td style={{ width: "40%", paddingBottom: "3px" }}>
                2. Sinh ngày: {patient.dob} <span style={{marginLeft: "20px"}}>Tuổi: <span style={{ border: "1px solid black", padding: "0 5px", minWidth: "40px", display: "inline-block", textAlign: "center" }}>{patient.age}</span></span>
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: "3px" }}>
                3. Giới: 1. Nam <span style={boxStyle}>{isMale ? "x" : ""}</span> 2. Nữ <span style={boxStyle}>{isFemale ? "x" : ""}</span>
              </td>
              <td style={{ paddingBottom: "3px" }}>
                4. Nghề nghiệp: {patient.job || "................................................"}&nbsp;&nbsp;&nbsp;
                <span style={{ border: "1px solid black", padding: "0 5px", minWidth: "40px", display: "inline-block", textAlign: "center" }}>{patient.jobCode || "00000"}</span>
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: "3px" }}>
                5. Dân tộc: {patient.ethnicity && typeof patient.ethnicity === 'object' ? patient.ethnicity.name : patient.ethnicity || "...................................."}&nbsp;&nbsp;&nbsp;
                <span style={{ border: "1px solid black", padding: "0 5px", minWidth: "40px", display: "inline-block", textAlign: "center" }}>{patient.ethnicity && typeof patient.ethnicity === 'object' ? patient.ethnicity.id : "1"}</span>
              </td>
              <td style={{ paddingBottom: "3px" }}>
                6. Ngoại kiều: {patient.nationality || "...................................."}&nbsp;&nbsp;&nbsp;
                <span style={{ border: "1px solid black", padding: "0 5px", minWidth: "40px", display: "inline-block", textAlign: "center" }}>{patient.nationality === "Việt Nam" ? "000" : "   "}</span>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ paddingBottom: "3px" }}>
                7. Địa chỉ: Số nhà: {patient.houseNumber || "............"}&nbsp;&nbsp;&nbsp; Thôn, phố: {patient.village || ".............................................."}&nbsp;&nbsp;&nbsp; Xã, phường: {patient.wardName || "...................................."}
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ paddingBottom: "3px" }}>
                Huyện (Q, Tx): {patient.districtName || "............................................................."}&nbsp;&nbsp;&nbsp; Tỉnh, thành phố: {patient.provinceName || ".........................................."}
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ paddingBottom: "3px" }}>
                8. Nơi làm việc: {patient.workplace || "..........................................................."} 
                <span style={{marginLeft: "40px"}}>9. Đối tượng: 1.BHYT<span style={boxStyle}>{patient.subjectType === "BHYT" ? "x" : ""}</span> 2.Thu phí<span style={boxStyle}>{patient.subjectType === "Thu phí" ? "x" : ""}</span> 3.Miễn<span style={boxStyle}>{patient.subjectType === "Miễn" ? "x" : ""}</span></span>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ paddingBottom: "3px" }}>
                10. BHYT giá trị đến ngày {patient.insuranceExpiry || ".......tháng...... năm......."}
                <span style={{marginLeft: "100px"}}>Số thẻ BHYT: <span style={{ border: "1px solid black", padding: "0 10px", fontWeight: "bold" }}>{patient.insuranceNumber || patient.healthInsuranceNumber || "........................"}</span></span>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ paddingBottom: "3px" }}>
                11. Họ tên, địa chỉ người nhà khi cần báo tin: {patient.relativeInfo || "................................................................................................................."}
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ paddingBottom: "3px" }}>
                ................................................................................................. Điện thoại số: {patient.relativePhone || "................................................"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* II. QUẢN LÝ NGƯỜI BỆNH */}
        <div style={{ fontWeight: "bold", marginBottom: "3px" }}>II. QUẢN LÝ NGƯỜI BỆNH:</div>
        <div style={{ border: "1px solid black", fontSize: "9pt", marginBottom: "10px" }}>
            <div style={{ display: "flex", borderBottom: "1px solid black" }}>
                <div style={{ flex: 1, padding: "2px 4px", borderRight: "1px solid black" }}>
                    <div style={{ marginBottom: "4px" }}>12. Vào viện: {adParts.time} ngày {adParts.day}/{adParts.month}/{adParts.year}</div>
                    <div>
                        13. Trực tiếp vào: 
                        1.Cấp cứu <span style={boxStyle}>{mData.admissionType === "Cấp cứu" ? "x" : ""}</span> 
                        2.KKB <span style={boxStyle}>{mData.admissionType === "KKB" ? "x" : ""}</span> 
                        3.Khoa điều trị <span style={boxStyle}>{mData.admissionType === "Khoa điều trị" ? "x" : ""}</span>
                    </div>
                </div>
                <div style={{ flex: 1, padding: "2px 4px" }}>
                    <div style={{ marginBottom: "4px" }}>
                        14. Nơi giới thiệu: 
                        1.Cơ quan y tế <span style={boxStyle}>{mData.referralSource === "Cơ quan y tế" ? "x" : ""}</span> 
                        2.Tự đến <span style={boxStyle}>{mData.referralSource === "Tự đến" ? "x" : ""}</span> 
                        3.Khác <span style={boxStyle}>{mData.referralSource === "Khác" ? "x" : ""}</span>
                    </div>
                    <div>- Vào viện do bệnh này lần thứ: {mData.admissionCount || "......."}</div>
                </div>
            </div>

            <div style={{ display: "flex", borderBottom: "1px solid black" }}>
                {/* Left: 15 & 16 */}
                <div style={{ flex: 1, padding: "5px 4px", borderRight: "1px solid black" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "4px", fontSize: "7.5pt" }}>
                        <div style={{ width: "90px" }}></div>
                        <div style={{ width: "80px", textAlign: "center", marginRight: "10px" }}>Khoa</div>
                        <div style={{ flex: 1, textAlign: "center" }}>ng/ th/ năm</div>
                        <div style={{ width: "60px", textAlign: "center", marginLeft: "10px" }}>Số ngày ĐTr</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ width: "90px" }}>15. Vào khoa:</span>
                        <div style={{ border: "1px solid black", padding: "0 10px", minWidth: "80px", textAlign: "center", fontWeight: "normal", marginRight: "10px" }}>{mData.transfers[0]?.department || record.department}</div>
                        <span style={{ flex: 1, textAlign: "center", fontSize: "7.5pt" }}>{adParts.time} {adParts.day}/{adParts.month}/{adParts.year}</span>
                        <div style={{ border: "1px solid black", padding: "0 10px", minWidth: "40px", textAlign: "center", fontWeight: "normal", marginLeft: "10px" }}>{mData.transfers[0]?.days || "0"}</div>
                    </div>

                    {renderTransferRow(mData.transfers[1])}
                    {renderTransferRow(mData.transfers[2])}
                </div>

                {/* Right: 17, 18 & 19 */}
                <div style={{ flex: 1, padding: "5px 4px" }}>
                    <div style={{ marginBottom: "10px" }}>
                        17. Chuyển viện: 
                        1.Tuyến trên <span style={boxStyle}>{mData.hospitalTransfer?.type === "Tuyến trên" ? "x" : ""}</span> 
                        2.Tuyến dưới <span style={boxStyle}>{mData.hospitalTransfer?.type === "Tuyến dưới" ? "x" : ""}</span> 
                        3.CK <span style={boxStyle}>{mData.hospitalTransfer?.type === "CK" ? "x" : ""}</span><br/>
                        - Chuyển đến: {mData.hospitalTransfer?.destination || "...................................................................."}<br/>
                        .........................................................................................
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                        18. Ra viện: {disParts.time} ngày {disParts.day}/{disParts.month}/{disParts.year}<br/>
                        1.Ra viện <span style={boxStyle}>{mData.dischargeType === "Ra viện" ? "x" : ""}</span> 
                        2.Xin về <span style={boxStyle}>{mData.dischargeType === "Xin về" ? "x" : ""}</span> 
                        3.Bỏ về <span style={boxStyle}>{mData.dischargeType === "Bỏ về" ? "x" : ""}</span> 
                        4.Đưa về <span style={boxStyle}>{mData.dischargeType === "Đưa về" ? "x" : ""}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span>19. Tổng số ngày điều trị:</span>
                        <div style={{ fontWeight: "bold", border: "1px solid black", padding: "0 15px", marginLeft: "10px" }}>{totalDays}</div>
                    </div>
                </div>
            </div>
        </div>

        {/* III. CHẨN ĐOÁN & RA VIỆN BLOCK */}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", marginBottom: "2px", fontSize: "9pt" }}>
            <div style={{ width: "50%", display: "flex", justifyContent: "space-between" }}>
                <span>III. CHẨN ĐOÁN</span>
                <span style={{ marginRight: "35px" }}>MÃ</span>
            </div>
            <div style={{ width: "50%", display: "flex", justifyContent: "flex-end" }}>
                <span style={{ marginRight: "35px" }}>MÃ</span>
            </div>
        </div>
        
        <div style={{ border: "1px solid black", fontSize: "8.5pt", marginBottom: "10px" }}>
            <div style={{ display: "flex" }}>
                {/* Left Column (20, 21, 22) */}
                <div style={{ width: "50%", borderRight: "1px solid black" }}>
                    <div style={{ padding: "4px", minHeight: "35px", position: "relative", borderBottom: "none" }}>
                        20. Nơi chuyển đến: {dInfo.transferDiagnosis?.name || "..........................................................................."}
                        <div style={{ position: "absolute", bottom: "4px", right: "10px", border: "1px solid black", width: "70px", height: "18px", textAlign: "center", lineHeight: "16px", fontWeight: "bold" }}>{dInfo.transferDiagnosis?.code}</div>
                    </div>
                    <div style={{ padding: "4px", minHeight: "55px", position: "relative", borderBottom: "none" }}>
                        21. KKB, Cấp cứu: {dInfo.kkbDiagnosis?.name || "..........................................................................."}
                        <div style={{ position: "absolute", bottom: "4px", right: "10px", border: "1px solid black", width: "70px", height: "18px", textAlign: "center", lineHeight: "16px", fontWeight: "bold" }}>{dInfo.kkbDiagnosis?.code}</div>
                    </div>
                    <div style={{ padding: "4px", minHeight: "50px", position: "relative", borderBottom: "none" }}>
                        22. Khi vào khoa điều trị: {dInfo.deptDiagnosis?.name || "..........................................................................."}
                        <div style={{ position: "absolute", bottom: "4px", right: "10px", border: "1px solid black", width: "70px", height: "18px", textAlign: "center", lineHeight: "16px", fontWeight: "bold" }}>{dInfo.deptDiagnosis?.code}</div>
                    </div>
                    <div style={{ padding: "4px", display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "10px" }}>+ Thủ thuật:</span> <span style={boxStyle}>{dInfo.deptDiagnosis?.isProcedure ? "x" : ""}</span>
                        <span style={{ marginLeft: "40px", marginRight: "10px" }}>+ Phẫu thuật:</span> <span style={boxStyle}>{dInfo.deptDiagnosis?.isSurgery ? "x" : ""}</span>
                    </div>
                </div>

                {/* Right Column (23) */}
                <div style={{ width: "50%" }}>
                    <div style={{ padding: "4px", borderBottom: "none", minHeight: "75px", position: "relative" }}>
                        23. Ra viện<br/>
                        + Bệnh chính: {dInfo.dischargeDiagnosis?.mainDisease?.name || "..........................................................................."}
                        <div style={{ position: "absolute", bottom: "4px", right: "10px", border: "1px solid black", width: "70px", height: "18px", textAlign: "center", lineHeight: "16px", fontWeight: "bold" }}>{dInfo.dischargeDiagnosis?.mainDisease?.code}</div>
                    </div>
                    <div style={{ padding: "4px", borderBottom: "none", minHeight: "65px", position: "relative" }}>
                        + Bệnh kèm theo: {dInfo.dischargeDiagnosis?.comorbidities?.name || "..........................................................................."}
                        <div style={{ position: "absolute", bottom: "4px", right: "10px", border: "1px solid black", width: "70px", height: "18px", textAlign: "center", lineHeight: "16px", fontWeight: "bold" }}>{dInfo.dischargeDiagnosis?.comorbidities?.code}</div>
                    </div>
                    <div style={{ padding: "4px", display: "flex", alignItems: "center" }}>
                        <span style={{ marginRight: "10px" }}>+ Tai biến:</span> <span style={boxStyle}>{dInfo.dischargeDiagnosis?.isAccident ? "x" : ""}</span>
                        <span style={{ marginLeft: "40px", marginRight: "10px" }}>+ Biến chứng:</span> <span style={boxStyle}>{dInfo.dischargeDiagnosis?.isComplication ? "x" : ""}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* IV. TÌNH TRẠNG RA VIỆN */}
        <div style={{ fontWeight: "bold", marginBottom: "3px", fontSize: "9pt" }}>IV. TÌNH TRẠNG RA VIỆN:</div>
        <div style={{ fontSize: "8.5pt", marginBottom: "15px" }}>
            <div style={{ display: "flex", border: "1px solid black" }}>
                {/* Left Column (24, 25) */}
                <div style={{ width: "40%", borderRight: "1px solid black", padding: "4px" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "4px" }}>24. Kết quả điều trị</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                        <span>1. Khỏi</span> <span style={boxStyle}>{dsInfo.treatmentResult === "Khoi" ? "x" : ""}</span>
                        <span style={{ marginLeft: "20px" }}>4. Nặng hơn</span> <span style={boxStyle}>{dsInfo.treatmentResult === "NangHon" ? "x" : ""}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                        <span>2. Đỡ, giảm</span> <span style={boxStyle}>{dsInfo.treatmentResult === "DoGiam" ? "x" : ""}</span>
                        <span style={{ marginLeft: "14px" }}>5. Tử vong</span> <span style={boxStyle}>{dsInfo.treatmentResult === "TuVong" ? "x" : ""}</span>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                        3. Không thay đổi <span style={boxStyle}>{dsInfo.treatmentResult === "KhongThayDoi" ? "x" : ""}</span>
                    </div>
                    <div style={{ paddingTop: "4px" }}>
                        <div style={{ fontWeight: "bold" }}>25. Giải phẫu bệnh <span style={{ fontWeight: "normal", fontSize: "7.5pt" }}>(Khi có sinh thiết)</span></div>
                        <div style={{ display: "flex", marginTop: "4px" }}>
                            <span>1.Lành tính</span> <span style={boxStyle}>{dsInfo.pathology === "Lành tính" ? "x" : ""}</span>
                            <span style={{ marginLeft: "5px" }}>2.Nghi ngờ</span> <span style={boxStyle}>{dsInfo.pathology === "Nghi ngờ" ? "x" : ""}</span>
                            <span style={{ marginLeft: "5px" }}>3.Ác tính</span> <span style={boxStyle}>{dsInfo.pathology === "Ác tính" ? "x" : ""}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column (26, 27, 28, 29) */}
                <div style={{ width: "60%", padding: "4px" }}>
                    <div style={{ marginBottom: "4px" }}>
                        26. Tình hình tử vong: ..........................................................................................
                    </div>
                    <div style={{ display: "flex", marginBottom: "4px" }}>
                        <div style={{ flex: 1 }}>
                            1. Do bệnh <span style={boxStyle}>{dsInfo.deathStatus?.cause === "Do bệnh" ? "x" : ""}</span><br/>
                            1. Trong 24 giờ vào viện <span style={boxStyle}>{dsInfo.deathStatus?.time === "Trong 24 giờ vào viện" ? "x" : ""}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            2. Do tai biến điều trị <span style={boxStyle}>{dsInfo.deathStatus?.cause === "Do tai biến điều trị" ? "x" : ""}</span><br/>
                            2. Sau 24 giờ vào viện <span style={boxStyle}>{dsInfo.deathStatus?.time === "Sau 24 giờ vào viện" ? "x" : ""}</span>
                        </div>
                        <div style={{ flex: 0.5 }}>
                            3. Khác <span style={boxStyle}>{dsInfo.deathStatus?.cause === "Khác" ? "x" : ""}</span>
                        </div>
                    </div>
                    
                    <div style={{ paddingTop: "4px", marginBottom: "5px" }}>
                        <div>27. Nguyên nhân chính tử vong: {dsInfo.mainCauseOfDeath?.name || "........................................................................"}</div>
                        <div style={{ textAlign: "right", marginTop: "2px" }}>
                            <div style={{ border: "1px solid black", display: "inline-block", width: "80px", height: "18px", textAlign: "center", lineHeight: "16px", fontWeight: "bold" }}>{dsInfo.mainCauseOfDeath?.code}</div>
                        </div>
                    </div>

                    <div style={{ paddingTop: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "2px" }}>
                            <span>28. Khám nghiệm tử thi:</span> <span style={boxStyle}>{dsInfo.isAutopsy ? "x" : ""}</span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            <span style={{ flex: 1 }}>29. Chẩn đoán giải phẫu tử thi: {dsInfo.autopsyDiagnosis?.name || "............................"}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ border: "1px solid black", display: "inline-block", width: "80px", height: "18px", textAlign: "center", lineHeight: "16px", fontWeight: "bold" }}>{dsInfo.autopsyDiagnosis?.code}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Signatures Page 1 */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", textAlign: "center", fontSize: "10pt", border: "none" }}>
          <div style={{ width: "45%", border: "none" }}>
            <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>GIÁM ĐỐC BỆNH VIỆN</div>
          </div>
          <div style={{ width: "45%", border: "none" }}>
            <div style={{ marginBottom: "5px" }}><i>Ngày {new Date().getDate()} tháng {new Date().getMonth()+1} năm {new Date().getFullYear()}</i></div>
            <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>TRƯỞNG KHOA</div>
          </div>
        </div>
      </div>

      {/* PAGE 2 - BỆNH ÁN */}
      <div style={pageStyle}>
        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>A. BỆNH ÁN</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ fontWeight: "bold" }}>I. Lý do vào viện: <span style={{ fontWeight: "normal" }}>{cData.reason || "................................................................."}</span></div>
            <div>Vào ngày thứ <span style={{ borderBottom: "1px solid black", padding: "0 10px", minWidth: "30px", display: "inline-block", textAlign: "center" }}>{cData.dayOfIllness || "..."}</span> của bệnh</div>
        </div>

        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>II. Hỏi bệnh:</div>
        <div style={{ fontWeight: "bold", marginLeft: "10px", marginBottom: "3px" }}>1. Quá trình bệnh lý: <span style={{ fontWeight: "normal", fontSize: "8pt" }}>(Khởi phát, diễn biến, chẩn đoán, điều trị của tuyến dưới v.v...)</span></div>
        <div style={{ marginBottom: "15px", paddingLeft: "15px", whiteSpace: "pre-wrap", textAlign: "justify", minHeight: "150px", lineHeight: "1.8" }}>
            {cData.pathologicalProcess || "................................................................................................................................\n................................................................................................................................\n................................................................................................................................"}
        </div>

        <div style={{ fontWeight: "bold", marginLeft: "10px", marginBottom: "3px" }}>2. Tiền sử bệnh:</div>
        <div style={{ paddingLeft: "15px", marginBottom: "10px" }}>
            <div style={{ marginBottom: "5px" }}><b>+ Bản thân:</b> <span style={{ fontSize: "8pt", fontWeight: "normal" }}>(phát triển thể lực từ nhỏ đến lớn, những bệnh đã mắc, phương pháp ĐTr, tiêm phòng, ăn uống, sinh hoạt v.v...)</span></div>
            <div style={{ marginBottom: "10px", minHeight: "30px", textAlign: "justify" }}>{cData.personalHistory || "................................................................................................................................"}</div>
        </div>

        {/* Related Characteristics Table - Two Column layout exactly like screenshot */}
        <div style={{ marginLeft: "15px", marginBottom: "15px", display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "3px", fontSize: "9pt" }}>Đặc điểm liên quan bệnh:</div>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", fontSize: "8.5pt", textAlign: "center" }}>
                    <thead>
                        <tr>
                            <th style={{ ...cellStyle, width: "10%" }}>TT</th>
                            <th style={{ ...cellStyle, width: "40%" }}>Ký hiệu</th>
                            <th style={{ ...cellStyle, width: "10%" }}></th>
                            <th style={{ ...cellStyle, width: "40%" }}>Thời gian (tính theo tháng)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={cellStyle}>01</td><td style={{ ...cellStyle, textAlign: "left" }}>Dị ứng</td><td style={cellStyle}><span style={boxStyle}>{cData.relatedCharacteristics?.allergy?.isChecked ? "x" : ""}</span></td><td style={cellStyle}>{cData.relatedCharacteristics?.allergy?.time}</td>
                        </tr>
                        <tr>
                            <td style={cellStyle}>02</td><td style={{ ...cellStyle, textAlign: "left" }}>Ma tuý</td><td style={cellStyle}><span style={boxStyle}>{cData.relatedCharacteristics?.drugs?.isChecked ? "x" : ""}</span></td><td style={cellStyle}>{cData.relatedCharacteristics?.drugs?.time}</td>
                        </tr>
                        <tr>
                            <td style={cellStyle}>03</td><td style={{ ...cellStyle, textAlign: "left" }}>Rượu bia</td><td style={cellStyle}><span style={boxStyle}>{cData.relatedCharacteristics?.alcohol?.isChecked ? "x" : ""}</span></td><td style={cellStyle}>{cData.relatedCharacteristics?.alcohol?.time}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "3px", color: "transparent", fontSize: "9pt" }}>Header Spacer</div>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid black", fontSize: "8.5pt", textAlign: "center" }}>
                    <thead>
                        <tr>
                            <th style={{ ...cellStyle, width: "10%" }}>TT</th>
                            <th style={{ ...cellStyle, width: "40%" }}>Ký hiệu</th>
                            <th style={{ ...cellStyle, width: "10%" }}></th>
                            <th style={{ ...cellStyle, width: "40%" }}>Thời gian (tính theo tháng)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={cellStyle}>04</td><td style={{ ...cellStyle, textAlign: "left" }}>Thuốc lá</td><td style={cellStyle}><span style={boxStyle}>{cData.relatedCharacteristics?.tobacco?.isChecked ? "x" : ""}</span></td><td style={cellStyle}>{cData.relatedCharacteristics?.tobacco?.time}</td>
                        </tr>
                        <tr>
                            <td style={cellStyle}>05</td><td style={{ ...cellStyle, textAlign: "left" }}>Thuốc lào</td><td style={cellStyle}><span style={boxStyle}>{cData.relatedCharacteristics?.pipeTobacco?.isChecked ? "x" : ""}</span></td><td style={cellStyle}>{cData.relatedCharacteristics?.pipeTobacco?.time}</td>
                        </tr>
                        <tr>
                            <td style={cellStyle}>06</td><td style={{ ...cellStyle, textAlign: "left" }}>Khác</td><td style={cellStyle}><span style={boxStyle}>{cData.relatedCharacteristics?.other?.isChecked ? "x" : ""}</span></td><td style={cellStyle}>{cData.relatedCharacteristics?.other?.time}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div style={{ paddingLeft: "15px", marginBottom: "15px" }}>
            <div style={{ marginBottom: "5px" }}><b>+ Gia đình:</b> <span style={{ fontSize: "8pt", fontWeight: "normal" }}>(Những người trong gia đình: bệnh đã mắc, đời sống, tinh thần, vật chất v.v...)</span></div>
            <div style={{ textAlign: "justify", minHeight: "30px" }}>{cData.familyHistory || "................................................................................................................................"}</div>
        </div>

        <div style={{ fontWeight: "bold", marginBottom: "5px" }}>III. KHÁM BỆNH:</div>
        <div style={{ fontWeight: "bold", marginLeft: "10px", marginBottom: "3px" }}>1. Toàn thân:</div>
        <div style={{ display: "flex", gap: "20px", marginBottom: "15px", paddingLeft: "15px" }}>
          <div style={{ flex: 1, whiteSpace: "pre-wrap", textAlign: "justify" }}>{cData.organs?.wholeBody || cData.overallExamination || ""}</div>
          <div style={{ width: "160px", borderLeft: "1px solid black", paddingLeft: "10px", fontSize: "9.5pt" }}>
            Mạch: <span style={{float:"right"}}>{cData.vitalSigns?.pulse || "..."} lần/ph</span><br/>
            Nhiệt độ: <span style={{float:"right"}}>{cData.vitalSigns?.temperature || "..."} °C</span><br/>
            Huyết áp: <span style={{float:"right"}}>{cData.vitalSigns?.bloodPressure || ".../..."} mmHg</span><br/>
            Nhịp thở: <span style={{float:"right"}}>{cData.vitalSigns?.respiratoryRate || "..."} lần/ph</span><br/>
            Cân nặng: <span style={{float:"right"}}>{cData.vitalSigns?.weight || "..."} kg</span>
          </div>
        </div>

        <div style={{ fontWeight: "bold", marginLeft: "10px", marginBottom: "3px" }}>2. Các cơ quan:</div>
        <div style={{ paddingLeft: "15px" }}>
            {[
                { label: "+ Tuần hoàn:", value: cData.organs?.circulatory },
                { label: "+ Hô hấp:", value: cData.organs?.respiratory },
                { label: "+ Tiêu hóa:", value: cData.organs?.digestive },
                { label: "+ Thận - Tiết niệu - Sinh dục:", value: cData.organs?.kidneyUrology }
            ].map((organ, idx) => (
                <div key={idx} style={{ marginBottom: "10px" }}>
                    <div style={{ fontWeight: "bold" }}>{organ.label}</div>
                    <div style={{ 
                        paddingLeft: "15px", 
                        minHeight: "54px", // Tương đương 3 dòng (18px * 3)
                        lineHeight: "18px", 
                        position: "relative",
                        textAlign: "justify",
                        whiteSpace: "pre-wrap"
                    }}>
                        {/* Dòng kẻ chấm làm nền */}
                        <div style={{ 
                            position: "absolute", 
                            top: 0, 
                            left: 15, 
                            right: 0, 
                            bottom: 0, 
                            zIndex: 0, 
                            backgroundImage: "linear-gradient(to bottom, transparent 17px, #999 17px, #999 18px)", 
                            backgroundSize: "100% 18px" 
                        }}></div>
                        {/* Nội dung thực tế nằm trên */}
                        <div style={{ position: "relative", zIndex: 1 }}>
                            {organ.value || ""}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* PAGE 3 - CHẨN ĐOÁN & ĐIỀU TRỊ */}
      <div style={pageStyle}>
        <div style={{ paddingLeft: "15px" }}>
            {[
                { label: "+ Thần kinh:", value: cData.organs?.neurological },
                { label: "+ Cơ - Xương - Khớp:", value: cData.organs?.musculoskeletal },
                { label: "+ Tai - Mũi - Họng:", value: cData.organs?.ent },
                { label: "+ Răng - Hàm - Mặt:", value: cData.organs?.maxillofacial },
                { label: "+ Mắt:", value: cData.organs?.eye },
                { label: "+ Nội tiết, dinh dưỡng và các bệnh lý khác:", value: cData.organs?.endocrineAndOthers }
            ].map((organ, idx) => (
                <div key={idx} style={{ marginBottom: "10px" }}>
                    <div style={{ fontWeight: "bold" }}>{organ.label}</div>
                    <div style={{ 
                        paddingLeft: "15px", 
                        minHeight: "54px", // 3 lines
                        lineHeight: "18px", 
                        position: "relative",
                        textAlign: "justify",
                        whiteSpace: "pre-wrap"
                    }}>
                        <div style={{ 
                            position: "absolute", 
                            top: 0, 
                            left: 15, 
                            right: 0, 
                            bottom: 0, 
                            zIndex: 0, 
                            backgroundImage: "linear-gradient(to bottom, transparent 17px, #999 17px, #999 18px)", 
                            backgroundSize: "100% 18px" 
                        }}></div>
                        <div style={{ position: "relative", zIndex: 1 }}>
                            {organ.value || ""}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div style={{ fontWeight: "bold", marginTop: "15px", marginBottom: "5px" }}>3. Các xét nghiệm cận lâm sàng cần làm:</div>
        <div style={{ 
            paddingLeft: "15px", 
            minHeight: "54px", 
            lineHeight: "18px", 
            position: "relative",
            textAlign: "justify",
            whiteSpace: "pre-wrap",
            marginBottom: "15px"
        }}>
            <div style={{ 
                position: "absolute", 
                top: 0, 
                left: 15, 
                right: 0, 
                bottom: 0, 
                zIndex: 0, 
                backgroundImage: "linear-gradient(to bottom, transparent 17px, #999 17px, #999 18px)", 
                backgroundSize: "100% 18px" 
            }}></div>
            <div style={{ position: "relative", zIndex: 1 }}>
                {cData.clinicalTests || ""}
            </div>
        </div>

        <div style={{ fontWeight: "bold", marginBottom: "3px" }}>4. Tóm tắt bệnh án:</div>
        <div style={{ 
            paddingLeft: "15px", 
            minHeight: "36px", // Reduced to 2 lines
            lineHeight: "18px", 
            position: "relative",
            textAlign: "justify",
            whiteSpace: "pre-wrap",
            marginBottom: "10px"
        }}>
            <div style={{ 
                position: "absolute", 
                top: 0, 
                left: 15, 
                right: 0, 
                bottom: 0, 
                zIndex: 0, 
                backgroundImage: "linear-gradient(to bottom, transparent 17px, #999 17px, #999 18px)", 
                backgroundSize: "100% 18px" 
            }}></div>
            <div style={{ position: "relative", zIndex: 1 }}>
                {cData.summary || ""}
            </div>
        </div>

        <div style={{ fontWeight: "bold", marginBottom: "3px" }}>IV. CHẨN ĐOÁN KHI VÀO KHOA ĐIỀU TRỊ:</div>
        <div style={{ 
            paddingLeft: "15px", 
            minHeight: "54px", // Reduced to 3 lines
            lineHeight: "18px", 
            position: "relative",
            marginBottom: "10px"
        }}>
            <div style={{ 
                position: "absolute", 
                top: 0, 
                left: 15, 
                right: 0, 
                bottom: 0, 
                zIndex: 0, 
                backgroundImage: "linear-gradient(to bottom, transparent 17px, #999 17px, #999 18px)", 
                backgroundSize: "100% 18px" 
            }}></div>
            <div style={{ position: "relative", zIndex: 1 }}>
                <div>+ Bệnh chính: {cData.admissionDiagnosis?.mainDisease || ""}</div>
                <div>+ Bệnh kèm theo (nếu có): {cData.admissionDiagnosis?.comorbidities || ""}</div>
                <div>+ Phân biệt: {cData.admissionDiagnosis?.differential || ""}</div>
            </div>
        </div>

        <div style={{ fontWeight: "bold", marginBottom: "3px" }}>V. TIÊN LƯỢNG:</div>
        <div style={{ 
            paddingLeft: "15px", 
            minHeight: "18px", // Reduced to 1 line
            lineHeight: "18px", 
            position: "relative",
            marginBottom: "10px"
        }}>
            <div style={{ 
                position: "absolute", 
                top: 0, 
                left: 15, 
                right: 0, 
                bottom: 0, 
                zIndex: 0, 
                backgroundImage: "linear-gradient(to bottom, transparent 17px, #999 17px, #999 18px)", 
                backgroundSize: "100% 18px" 
            }}></div>
            <div style={{ position: "relative", zIndex: 1 }}>
                {cData.prognosis || ""}
            </div>
        </div>

        <div style={{ fontWeight: "bold", marginBottom: "3px" }}>VI. HƯỚNG ĐIỀU TRỊ:</div>
        <div style={{ 
            paddingLeft: "15px", 
            minHeight: "36px", // Reduced to 2 lines
            lineHeight: "18px", 
            position: "relative",
            marginBottom: "20px"
        }}>
            <div style={{ 
                position: "absolute", 
                top: 0, 
                left: 15, 
                right: 0, 
                bottom: 0, 
                zIndex: 0, 
                backgroundImage: "linear-gradient(to bottom, transparent 17px, #999 17px, #999 18px)", 
                backgroundSize: "100% 18px" 
            }}></div>
            <div style={{ position: "relative", zIndex: 1 }}>
                {cData.treatmentPlan || ""}
            </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto", textAlign: "center", fontSize: "9.5pt", paddingBottom: "20mm" }}>
          <div style={{ width: "45%" }}>
            <div><i>Ngày {adParts.day} tháng {adParts.month} năm {adParts.year}</i></div>
            <div style={{ fontWeight: "bold", marginTop: "5px" }}>Bác sĩ làm bệnh án</div>
            <div style={{ height: "120px" }}></div>
          </div>
        </div>
      </div>

      {/* PAGE 4+ - CLINICAL RESULTS (SECTION V) */}
      {(record.documents || []).filter(doc => (doc.type === "X-Quang" || doc.type === "XN-HuyetHoc") && doc.data?.status === 3).map((doc, index) => {
          const enrichedData = {
              ...doc.data,
              patientName: doc.data?.patientName || record.patientName,
              age: doc.data?.age || record.age,
              gender: doc.data?.gender || record.gender,
              address: doc.data?.address || record.address,
              department: doc.data?.department || record.department,
              bed: doc.data?.bed || record.bedCode,
              insuranceNumber: doc.data?.insuranceNumber || record.insuranceNumber,
              diagnosis: doc.data?.diagnosis || record.diagnosisInfo?.deptDiagnosis?.name || ""
          };

          return (
              <div key={doc.id || index} style={{ ...pageStyle, padding: "0mm" }}>
                  <div style={{ transformOrigin: "top center" }}>
                      {doc.type === "X-Quang" ? <XRayPaper data={enrichedData} /> : <HematologyPaper data={enrichedData} />}
                  </div>
              </div>
          );
      })}

      {/* SECTION VI - ATTACHMENTS - RENDER IMAGES ONLY (PDFs are handled by pdf-lib merge) */}
      {attachments.map((doc, index) => {
          const cleanPath = (doc.path || "").split('?')[0];
          const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(cleanPath || doc.fileName || "");
          
          if (!isImage) return null; // Skip non-image files in HTML template

          return (
              <div key={doc.id || index} style={{ ...pageStyle, padding: "5mm" }}>
                  <div style={{ textAlign: "center", width: "100%", height: "280mm", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img 
                          src={doc.path} 
                          alt={doc.name} 
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} 
                      />
                  </div>
              </div>
          );
      })}
    </div>
  );
};
