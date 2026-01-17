import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore } from '@/store';
import { Card, Button, Badge, Modal, Input, Select } from '@/components/UI';
import { Car, CarFormData, getCarStatusLabel, getFuelTypeLabel, getTransmissionLabel, formatCarName } from '@/types';
import styles from './MyCarsPage.module.scss';

export const MyCarsPage = observer(() => {
  const { cars, activeLocations, createCar, updateCar, deleteCar, getLocationById } = dataStore;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<CarFormData>({ brand: '', model: '', year: 2024, licensePlate: '', fuelType: 'petrol', transmission: 'automatic', seats: 5, pricePerDay: 2000, locationId: '' });

  const myCars = cars.filter(c => c.isActive);

  const handleOpenModal = (car?: Car) => {
    if (car) { setEditingCar(car); setFormData({ brand: car.brand, model: car.model, year: car.year, licensePlate: car.licensePlate, fuelType: car.fuelType, transmission: car.transmission, seats: car.seats, pricePerDay: car.pricePerDay, locationId: car.locationId }); }
    else { setEditingCar(null); setFormData({ brand: '', model: '', year: 2024, licensePlate: '', fuelType: 'petrol', transmission: 'automatic', seats: 5, pricePerDay: 2000, locationId: activeLocations[0]?.id || '' }); }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => { if (editingCar) await updateCar(editingCar.id, formData); else await createCar(formData); setIsModalOpen(false); };
  const handleDelete = async (id: string) => { if (confirm('Удалить автомобиль?')) await deleteCar(id); };

  return (
    <div className={styles.page}>
      <div className={styles.header}><h1 className={styles.title}>Мои автомобили</h1><Button variant="primary" onClick={() => handleOpenModal()}>Добавить авто</Button></div>
      {myCars.length === 0 ? <div className={styles.empty}>У вас пока нет автомобилей</div> : (
        <div className={styles.grid}>
          {myCars.map(car => (
            <Card key={car.id} className={styles.carCard}>
              <div className={styles.carHeader}><h3>{formatCarName(car)}</h3><Badge variant={car.status === 'available' ? 'success' : 'warning'}>{getCarStatusLabel(car.status)}</Badge></div>
              <div className={styles.carDetails}><span>{getFuelTypeLabel(car.fuelType)}</span><span>{getTransmissionLabel(car.transmission)}</span><span>{car.seats} мест</span></div>
              <p className={styles.location}>{getLocationById(car.locationId)?.name}</p>
              <div className={styles.carPrice}>{car.pricePerDay} ₽/день</div>
              <div className={styles.carActions}>
                <Button size="sm" variant="secondary" onClick={() => handleOpenModal(car)}>Редактировать</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(car.id)}>Удалить</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCar ? 'Редактировать авто' : 'Добавить авто'}>
        <div className={styles.form}>
          <Input label="Марка" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
          <Input label="Модель" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
          <Input label="Год" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} required />
          <Input label="Госномер" value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })} required />
          <Input label="Цена за день (₽)" type="number" value={formData.pricePerDay} onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })} required />
          <Select label="Локация" options={activeLocations.map(l => ({ value: l.id, label: l.name }))} value={formData.locationId} onChange={(e) => setFormData({ ...formData, locationId: e.target.value })} />
          <div className={styles.formActions}><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleSubmit}>{editingCar ? 'Сохранить' : 'Добавить'}</Button></div>
        </div>
      </Modal>
    </div>
  );
});
