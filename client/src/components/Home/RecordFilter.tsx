import { Search, Filter as FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RECORD_TYPES } from "@/constants/recordTypes";

interface RecordFilterProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  fromDay?: string;
  onFromDayChange?: (val: string) => void;
  toDay?: string;
  onToDayChange?: (val: string) => void;
  onFilter?: () => void;
}

export const RecordFilter = ({
  inputValue,
  setInputValue,
  filterType,
  setFilterType,
  fromDay = "",
  onFromDayChange,
  toDay = "",
  onToDayChange,
  onFilter,
}: RecordFilterProps) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <Input
              className="pl-9 h-9"
              placeholder="Tìm kiếm theo Mã lưu trữ, tên hoặc số cccd"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          {onFromDayChange && (
            <div className="flex items-center gap-2">
              <Label htmlFor="fromDay" className="text-sm font-medium text-gray-600 whitespace-nowrap">Từ ngày</Label>
              <Input
                id="fromDay"
                type="date"
                value={fromDay}
                onChange={(e) => onFromDayChange(e.target.value)}
                className="w-[140px] h-9"
              />
            </div>
          )}
          {onToDayChange && (
            <div className="flex items-center gap-2">
              <Label htmlFor="toDay" className="text-sm font-medium text-gray-600 whitespace-nowrap">Đến ngày</Label>
              <Input
                id="toDay"
                type="date"
                value={toDay}
                onChange={(e) => onToDayChange(e.target.value)}
                className="w-[140px] h-9"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex items-center text-gray-500 text-sm font-medium whitespace-nowrap">
              Loại hồ sơ:
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px] h-9 bg-white">
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {RECORD_TYPES.map((type) => (
                  <SelectItem
                    key={type.id}
                    value={type.id}
                    disabled={type.id !== "internal" && type.id !== "surgery"}
                  >
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {onFilter && (
            <Button onClick={onFilter} className="h-9 bg-vlu-red hover:bg-red-700 text-white">
              <FilterIcon className="w-4 h-4 mr-2" />
              Lọc
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
