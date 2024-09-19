import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { DollarSign, TrendingUp, Users, Briefcase, ShieldCheck, UserPlus, Layers, Calculator, Settings, Save, Download, Trash2, Printer, User, Hash } from 'lucide-react'

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value)
}

const parseFormattedNumber = (value: string) => {
  return parseFloat(value.replace(/,/g, '')) || 0
}

export default function EmployeeBonusCalculator() {
  const [formData, setFormData] = useState({
    name: '',
    employeeNumber: '',
    currentMonthSales: 70000,
    lastYearSameMonthSales: 50000,
    currentMonthBookOfBusiness: 2500000,
    lastYearSameMonthBookOfBusiness: 2225000,
    retainedClientsEmployee: 50,
    totalRetainedClients: 500,
    newClientsEmployee: 5,
    totalNewClients: 20,
    totalClientsManaged: 100,
    totalClientsCompany: 500,
    numberOfPoliciesEmployee: 10,
    totalNumberOfPolicies: 27
  })

  interface BonusReport {
    name: string;
    employeeNumber: string;
    salesGrowth: number;
    businessGrowth: number;
    bonusPercentage: number;
    retainedClientsBonus: number;
    newClientsBonus: number;
    clientsManagedBonus: number;
    policiesBonus: number;
    totalBonus: number;
  }
  
  const [bonusReport, setBonusReport] = useState<BonusReport | null>(null)

  const [settings, setSettings] = useState({
    bonusPercentages: [1, 2, 3, 4, 5],
    salesGrowthThresholds: [0, 5, 10, 15, 20],
    businessGrowthThresholds: [0, 2.5, 5, 7.5, 10],
    retainedClientsBonusMultiplier: 1000,
    newClientsBonusMultiplier: 2000,
    clientsManagedBonusMultiplier: 1500,
    policiesBonusMultiplier: 500
  })

  const reportRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'name' || name === 'employeeNumber' ? value : parseFormattedNumber(value)
    }))
  }

  const handleSettingsChange = (name: string, value: string, index: number | null = null) => {
    setSettings(prevState => {
      if (index !== null) {
        const newArray = [...(prevState[name as keyof typeof settings] as number[])]
        newArray[index] = parseFloat(value)
        return { ...prevState, [name]: newArray }
      }
      return { ...prevState, [name]: parseFloat(value) }
    })
  }

  const calculateBonus = () => {
    const salesGrowth = (formData.currentMonthSales - formData.lastYearSameMonthSales) / formData.lastYearSameMonthSales * 100
    const businessGrowth = (formData.currentMonthBookOfBusiness - formData.lastYearSameMonthBookOfBusiness) / formData.lastYearSameMonthBookOfBusiness * 100
    
    let bonusPercentage = settings.bonusPercentages[0]
    for (let i = 1; i < 5; i++) {
      if (salesGrowth >= settings.salesGrowthThresholds[i] && businessGrowth >= settings.businessGrowthThresholds[i]) {
        bonusPercentage = settings.bonusPercentages[i]
      }
    }

    const retainedClientsBonus = (formData.retainedClientsEmployee / formData.totalRetainedClients) * settings.retainedClientsBonusMultiplier
    const newClientsBonus = (formData.newClientsEmployee / formData.totalNewClients) * settings.newClientsBonusMultiplier
    const clientsManagedBonus = (formData.totalClientsManaged / formData.totalClientsCompany) * settings.clientsManagedBonusMultiplier
    const policiesBonus = (formData.numberOfPoliciesEmployee / formData.totalNumberOfPolicies) * settings.policiesBonusMultiplier

    const totalBonus = retainedClientsBonus + newClientsBonus + clientsManagedBonus + policiesBonus

    setBonusReport({
      name: formData.name,
      employeeNumber: formData.employeeNumber,
      salesGrowth,
      businessGrowth,
      bonusPercentage,
      retainedClientsBonus,
      newClientsBonus,
      clientsManagedBonus,
      policiesBonus,
      totalBonus
    })
  }

  const clearForm = () => {
    setFormData({
      name: '',
      employeeNumber: '',
      currentMonthSales: 0,
      lastYearSameMonthSales: 0,
      currentMonthBookOfBusiness: 0,
      lastYearSameMonthBookOfBusiness: 0,
      retainedClientsEmployee: 0,
      totalRetainedClients: 0,
      newClientsEmployee: 0,
      totalNewClients: 0,
      totalClientsManaged: 0,
      totalClientsCompany: 0,
      numberOfPoliciesEmployee: 0,
      totalNumberOfPolicies: 0
    })
    setBonusReport(null)
  }

  const clearSettings = () => {
    setSettings({
      bonusPercentages: [1, 2, 3, 4, 5],
      salesGrowthThresholds: [0, 5, 10, 15, 20],
      businessGrowthThresholds: [0, 2.5, 5, 7.5, 10],
      retainedClientsBonusMultiplier: 1000,
      newClientsBonusMultiplier: 2000,
      clientsManagedBonusMultiplier: 1500,
      policiesBonusMultiplier: 500
    })
    toast({
      title: "Settings Cleared",
      description: "All settings have been reset to default values.",
    })
  }

  const saveSettings = () => {
    localStorage.setItem('bonusCalculatorSettings', JSON.stringify(settings))
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('bonusCalculatorSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const generateReport = () => {
    if (reportRef.current) {
      const printContent = reportRef.current.innerHTML
      const printWindow = window.open('', '_blank')

      if (!printWindow) {
        toast({
          title: "Error",
          description: "Please allow popups for this site to print the report.",
          variant: "destructive",
        })
        return
      }
    else {
        printWindow.document.write(`
            <html>
              <head>
                <title>Bonus Calculation Report</title>
                <style>
                  body { font-family: Arial, sans-serif; }
                  table { width: 100%; border-collapse: collapse; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                </style>
              </head>
              <body>
                ${printContent}
              </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.print()
    }
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Employee Bonus Calculator</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Calculator Settings</DialogTitle>
              <DialogDescription>Adjust the parameters for bonus calculation</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Bonus %</h3>
                  {settings.bonusPercentages.map((percentage, index) => (
                    <div key={`bonus-${index}`} className="flex items-center space-x-2 mb-2">
                      <Label htmlFor={`bonusPercentage${index}`} className="w-6">{index + 1}:</Label>
                      <Input
                        id={`bonusPercentage${index}`}
                        type="number"
                        value={percentage}
                        onChange={(e) => handleSettingsChange('bonusPercentages', e.target.value, index)}
                        className="w-20"
                      />
                      <span>%</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sales Growth</h3>
                  {settings.salesGrowthThresholds.map((threshold, index) => (
                    <div key={`sales-${index}`} className="flex items-center space-x-2 mb-2">
                      <Label htmlFor={`salesGrowthThreshold${index}`} className="w-6">{index + 1}:</Label>
                      <Input
                        id={`salesGrowthThreshold${index}`}
                        type="number"
                        value={threshold}
                        onChange={(e) => handleSettingsChange('salesGrowthThresholds', e.target.value, index)}
                        className="w-20"
                      />
                      <span>%</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Business Growth</h3>
                  {settings.businessGrowthThresholds.map((threshold, index) => (
                    <div key={`business-${index}`} className="flex items-center space-x-2 mb-2">
                      <Label htmlFor={`businessGrowthThreshold${index}`} className="w-6">{index + 1}:</Label>
                      <Input
                        id={`businessGrowthThreshold${index}`}
                        type="number"
                        value={threshold}
                        onChange={(e) => handleSettingsChange('businessGrowthThresholds', e.target.value, index)}
                        className="w-20"
                      />
                      <span>%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Bonus Multipliers</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Retained Clients', key: 'retainedClientsBonusMultiplier' },
                    { label: 'New Clients', key: 'newClientsBonusMultiplier' },
                    { label: 'Clients Managed', key: 'clientsManagedBonusMultiplier' },
                    { label: 'Policies', key: 'policiesBonusMultiplier' },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Label htmlFor={key} className="w-32">{label}:</Label>
                      <Input
                        id={key}
                        type="number"
                        value={parseFloat(settings[key as keyof typeof settings].toString())}
                        onChange={(e) => handleSettingsChange(key, e.target.value)}
                        className="w-24"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button onClick={clearSettings} variant="outline" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
                <Button onClick={saveSettings} variant="outline" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <label htmlFor="load-settings" className="cursor-pointer">
                  <Input
                    id="load-settings"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={loadSettings}
                  />
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Load
                  </Button>
                </label>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-t-4 border-t-primary">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Input Data
          </CardTitle>
          <CardDescription>Enter the required data to calculate the employee bonus</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Employee Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeNumber" className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  Employee Number
                </Label>
                <Input
                  id="employeeNumber"
                  name="employeeNumber"
                  type="text"
                  value={formData.employeeNumber}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentMonthSales" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Current Month Sales
                </Label>
                <Input
                  id="currentMonthSales"
                  name="currentMonthSales"
                  type="text"
                  value={formatNumber(formData.currentMonthSales)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastYearSameMonthSales" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Last Year Same Month Sales
                </Label>
                <Input
                  id="lastYearSameMonthSales"
                  name="lastYearSameMonthSales"
                  type="text"
                  value={formatNumber(formData.lastYearSameMonthSales)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentMonthBookOfBusiness" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Current Month Book of Business
                </Label>
                <Input
                  id="currentMonthBookOfBusiness"
                  name="currentMonthBookOfBusiness"
                  type="text"
                  value={formatNumber(formData.currentMonthBookOfBusiness)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastYearSameMonthBookOfBusiness" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  Last Year Same Month Book of Business
                </Label>
                <Input
                  id="lastYearSameMonthBookOfBusiness"
                  name="lastYearSameMonthBookOfBusiness"
                  type="text"
                  value={formatNumber(formData.lastYearSameMonthBookOfBusiness)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retainedClientsEmployee" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Retained Clients (Employee)
                </Label>
                <Input
                  id="retainedClientsEmployee"
                  name="retainedClientsEmployee"
                  type="text"
                  value={formatNumber(formData.retainedClientsEmployee)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalRetainedClients" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Total Retained Clients
                </Label>
                <Input
                  id="totalRetainedClients"
                  name="totalRetainedClients"
                  type="text"
                  value={formatNumber(formData.totalRetainedClients)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newClientsEmployee" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                  New Clients (Employee)
                </Label>
                <Input
                  id="newClientsEmployee"
                  name="newClientsEmployee"
                  type="text"
                  value={formatNumber(formData.newClientsEmployee)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalNewClients" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                  Total New Clients
                </Label>
                <Input
                  id="totalNewClients"
                  name="totalNewClients"
                  type="text"
                  value={formatNumber(formData.totalNewClients)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalClientsManaged" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Total Clients Managed (Employee)
                </Label>
                <Input
                  id="totalClientsManaged"
                  name="totalClientsManaged"
                  type="text"
                  value={formatNumber(formData.totalClientsManaged)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalClientsCompany" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Total Clients (Company)
                </Label>
                <Input
                  id="totalClientsCompany"
                  name="totalClientsCompany"
                  type="text"
                  value={formatNumber(formData.totalClientsCompany)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfPoliciesEmployee" className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Number of Policies (Employee)
                </Label>
                <Input
                  id="numberOfPoliciesEmployee"
                  name="numberOfPoliciesEmployee"
                  type="text"
                  value={formatNumber(formData.numberOfPoliciesEmployee)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalNumberOfPolicies" className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Total Number of Policies
                </Label>
                <Input
                  id="totalNumberOfPolicies"
                  name="totalNumberOfPolicies"
                  type="text"
                  value={formatNumber(formData.totalNumberOfPolicies)}
                  onChange={handleInputChange}
                  className="border-primary/20"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button type="button" onClick={clearForm} variant="outline" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> Clear Form
              </Button>
              <Button type="button" onClick={calculateBonus} className="bg-primary hover:bg-primary/90">
                <Calculator className="mr-2 h-4 w-4" /> Calculate Bonus
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {bonusReport && (
        <Card className="border-t-4 border-t-secondary">
          <CardHeader className="bg-secondary/5">
            <CardTitle className="text-2xl text-secondary flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Bonus Calculation Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={reportRef}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Employee Name</TableCell>
                    <TableCell>{bonusReport.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Employee Number</TableCell>
                    <TableCell>{bonusReport.employeeNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sales Growth</TableCell>
                    <TableCell>{bonusReport.salesGrowth.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Business Growth</TableCell>
                    <TableCell>{bonusReport.businessGrowth.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Bonus Percentage</TableCell>
                    <TableCell>{bonusReport.bonusPercentage}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Retained Clients Bonus</TableCell>
                    <TableCell>${parseFloat(bonusReport.retainedClientsBonus.toFixed(2))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">New Clients Bonus</TableCell>
                    <TableCell>${parseFloat(bonusReport.newClientsBonus.toFixed(2))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Clients Managed Bonus</TableCell>
                    <TableCell>${parseFloat(bonusReport.clientsManagedBonus.toFixed(2))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Policies Bonus</TableCell>
                    <TableCell>${parseFloat(bonusReport.policiesBonus.toFixed(2))}</TableCell>
                  </TableRow>
                  <TableRow className="bg-secondary/5">
                    <TableCell className="font-bold text-lg">Total Bonus</TableCell>
                    <TableCell className="font-bold text-lg">${parseFloat(bonusReport.totalBonus.toFixed(2))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={generateReport} className="flex items-center gap-2">
                <Printer className="h-4 w-4" /> Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}