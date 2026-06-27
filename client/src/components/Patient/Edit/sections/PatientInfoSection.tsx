import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";

interface Ethnicity {
  id: number;
  name: string;
}

interface PatientFormData {
  name?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: number;
  ethnicityId?: number;
  healthInsuranceNumber?: string;
}

interface PatientInfoProps {
  formData: PatientFormData;
  handleChange: (field: string, value: string | number) => void;
}

export const PatientInfoSection = ({ formData, handleChange }: PatientInfoProps) => {
  const [ethnicities, setEthnicities] = useState<Ethnicity[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchEthnicities = async () => {
      try {
        const data = await api.ethnicities.getAll();
        if (isMounted) {
          setEthnicities(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch ethnicities:', err);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEthnicities();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedEthnicity = ethnicities.find(e => e.id === formData.ethnicityId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <span className="font-bold text-gray-500 w-6">1.</span>
        <div className="flex-1">
          <Label className="mb-1.5 block">Họ và tên (In hoa) <span className="text-red-500">*</span></Label>
          <Input 
            required
            className="uppercase font-bold"
            placeholder="NGUYỄN VĂN A"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-bold text-gray-500 w-6">2.</span>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label className="mb-1.5 block">Sinh ngày <span className="text-red-500">*</span></Label>
            <Input
              required
              type="date"
              max={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0]}
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            />          </div>
          <div>
            <Label className="mb-1.5 block">Tuổi</Label>
            <Input 
              readOnly
              className="bg-gray-50"
              value={formData.age}
              placeholder="Auto"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-bold text-gray-500 w-6">3.</span>
        <div className="flex-1">
          <Label className="mb-2 block">Giới tính <span className="text-red-500">*</span></Label>
          <RadioGroup 
            value={formData.gender?.toString()} 
            onValueChange={(val) => handleChange('gender', parseInt(val))}
            className="flex gap-6 mt-1.5"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="r1" />
              <Label htmlFor="r1" className="font-normal cursor-pointer">Nam</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="r2" />
              <Label htmlFor="r2" className="font-normal cursor-pointer">Nữ</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="r3" />
              <Label htmlFor="r3" className="font-normal cursor-pointer">Khác</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-bold text-gray-500 w-6">4.</span>
        <div className="flex-1">
          <Label className="mb-1.5 block">Dân tộc <span className="text-red-500">*</span></Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={loading}
                className="w-full justify-between h-10 font-normal text-left"
              >
                {loading ? (
                  <span className="flex items-center text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải dân tộc...
                  </span>
                ) : selectedEthnicity ? (
                  selectedEthnicity.name
                ) : (
                  <span className="text-muted-foreground">Chọn dân tộc...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Tìm kiếm dân tộc..." className="h-9" />
                <CommandList>
                  <CommandEmpty>Không tìm thấy dân tộc.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {ethnicities.map((ethnicity) => (
                      <CommandItem
                        key={ethnicity.id}
                        value={ethnicity.name}
                        onSelect={() => {
                          handleChange('ethnicityId', ethnicity.id);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.ethnicityId === ethnicity.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {ethnicity.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="font-bold text-gray-500 w-6">5.</span>
        <div className="flex-1">
          <Label className="mb-1.5 block">Số thẻ BHYT <span className="text-red-500">*</span></Label>
          <Input 
            required
            maxLength={15}
            placeholder="DN1234567890123 (2 chữ + 13 số)"
            value={formData.healthInsuranceNumber}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              handleChange('healthInsuranceNumber', value);
            }}
            pattern="[A-Z]{2}[0-9]{13}"
            title="Số BHYT phải có 2 chữ cái in hoa và 13 chữ số"
          />
          <p className="text-xs text-gray-500 mt-1">Ví dụ: DN1234567890123</p>
        </div>
      </div>
    </div>
  );
};
