import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, authStore } from '@/store';
import { Card, Button, Input, Select, Badge, Modal } from '@/components/UI';
import { CarFormData, getCarStatusLabel, getFuelTypeLabel, getTransmissionLabel, formatCarName } from '@/types';
import styles from './CarsPage.module.scss';

export const CarsPage = observer(() => {
  const { filteredCars, activeLocations, carsLoading, setFilter, createCar, getLocationById } = dataStore;
  const { isOwner } = authStore;
  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CarFormData>({ brand: '', model: '', year: 2024, licensePlate: '', fuelType: 'petrol', transmission: 'automatic', seats: 5, pricePerDay: 2000, locationId: '' });

  useEffect(() => { const timer = setTimeout(() => { setFilter('search', searchValue || undefined); }, 300); return () => clearTimeout(timer); }, [searchValue, setFilter]);

  const handleSubmit = async () => { await createCar(formData); setIsModalOpen(false); };

  const fuelOptions = [{ value: '', label: 'Все типы' }, { value: 'petrol', label: 'Бензин' }, { value: 'diesel', label: 'Дизель' }, { value: 'electric', label: 'Электро' }, { value: 'hybrid', label: 'Гибрид' }];
  const transmissionOptions = [{ value: '', label: 'Любая КПП' }, { value: 'manual', label: 'Механика' }, { value: 'automatic', label: 'Автомат' }];
  const locationOptions = [{ value: '', label: 'Все локации' }, ...activeLocations.map(l => ({ value: l.id, label: l.name }))];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Каталог автомобилей</h1>
        {isOwner && <Button variant="primary" onClick={() => setIsModalOpen(true)}>Добавить авто</Button>}
      </div>
      <div className={styles.filters}>
        <Input placeholder="Поиск по марке/модели..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className={styles.searchInput} />
        <Select options={locationOptions} value="" onChange={(e) => setFilter('locationId', e.target.value || undefined)} />
        <Select options={fuelOptions} value="" onChange={(e) => setFilter('fuelType', e.target.value || undefined)} />
        <Select options={transmissionOptions} value="" onChange={(e) => setFilter('transmission', e.target.value || undefined)} />
      </div>
      {carsLoading ? <div className={styles.loading}>Загрузка...</div> : filteredCars.length === 0 ? <div className={styles.empty}>Автомобили не найдены</div> : (
        <div className={styles.grid}>
          {filteredCars.map(car => (
            <Card key={car.id} className={styles.carCard}>
              <div className={styles.carHeader}>
                <h3 className={styles.carName}>{formatCarName(car)}</h3>
                <Badge variant={car.status === 'available' ? 'success' : 'warning'}>{getCarStatusLabel(car.status)}</Badge>
              </div>
              <div className={styles.carDetails}>
                <span>{getFuelTypeLabel(car.fuelType)}</span>
                <span>{getTransmissionLabel(car.transmission)}</span>
                <span>{car.seats} мест</span>
              </div>
              <p className={styles.location}>{getLocationById(car.locationId)?.name || 'Не указано'}</p>
              <div className={styles.carPrice}>{car.pricePerDay} ₽/день</div>
            </Card>
          ))}
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Добавить автомобиль">
        <div className={styles.form}>
          <Input label="Марка" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
          <Input label="Модель" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} required />
          <Input label="Год" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} required />
          <Input label="Госномер" value={formData.licensePlate} onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })} required />
          <Input label="Цена за день (₽)" type="number" value={formData.pricePerDay} onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })} required />
          <Select label="Локация" options={activeLocations.map(l => ({ value: l.id, label: l.name }))} value={formData.locationId} onChange={(e) => setFormData({ ...formData, locationId: e.target.value })} required />
          <div className={styles.formActions}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Отмена</Button>
            <Button variant="primary" onClick={handleSubmit}>Добавить</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});
