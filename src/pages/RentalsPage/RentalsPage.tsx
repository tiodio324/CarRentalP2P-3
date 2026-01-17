import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, authStore } from '@/store';
import { Card, Button, Select, Badge, Modal, Input, Table } from '@/components/UI';
import { Rental, RentalFormData, getRentalStatusLabel, getRentalStatusColor, RentalStatus } from '@/types';
import styles from './RentalsPage.module.scss';

export const RentalsPage = observer(() => {
  const { rentals, activeRentals, activeCars, rentalsLoading, createRental, updateRentalStatus } = dataStore;
  const { isOwner } = authStore;
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<RentalFormData>({ carId: '', renterName: '', startDate: '', endDate: '' });

  const filteredRentals = statusFilter === 'active' ? activeRentals : statusFilter === 'all' ? rentals : rentals.filter(r => r.status === statusFilter);
  const statusOptions = [{ value: 'active', label: 'Активные' }, { value: 'all', label: 'Все' }, { value: 'pending', label: 'Ожидают' }, { value: 'confirmed', label: 'Подтверждённые' }, { value: 'completed', label: 'Завершённые' }];

  const handleSubmit = async () => { await createRental(formData); setIsModalOpen(false); };
  const handleStatusChange = async (id: string, status: RentalStatus) => { await updateRentalStatus(id, status); };

  const columns = [
    { key: 'carName', title: 'Автомобиль' },
    { key: 'renterName', title: 'Арендатор' },
    { key: 'startDate', title: 'Начало', render: (r: Rental) => new Date(r.startDate).toLocaleDateString('ru-RU') },
    { key: 'endDate', title: 'Конец', render: (r: Rental) => new Date(r.endDate).toLocaleDateString('ru-RU') },
    { key: 'totalPrice', title: 'Сумма', render: (r: Rental) => `${r.totalPrice} ₽` },
    { key: 'status', title: 'Статус', render: (r: Rental) => <Badge variant={getRentalStatusColor(r.status) as 'success' | 'warning' | 'error' | 'info'}>{getRentalStatusLabel(r.status)}</Badge> },
  ];

  if (isOwner) {
    columns.push({
      key: 'actions', title: 'Действия',
      render: (r: Rental) => r.status === 'pending' ? <Button size="sm" onClick={() => handleStatusChange(r.id, 'confirmed')}>Подтвердить</Button> : r.status === 'confirmed' ? <Button size="sm" onClick={() => handleStatusChange(r.id, 'active')}>Начать</Button> : r.status === 'active' ? <Button size="sm" onClick={() => handleStatusChange(r.id, 'completed')}>Завершить</Button> : <></>
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Аренды</h1>
        {isOwner && <Button variant="primary" onClick={() => setIsModalOpen(true)}>Новая аренда</Button>}
      </div>
      <div className={styles.filters}><Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} /></div>
      {rentalsLoading ? <div className={styles.loading}>Загрузка...</div> : filteredRentals.length === 0 ? <div className={styles.empty}>Аренды не найдены</div> : <Card className={styles.tableCard}><Table columns={columns} data={filteredRentals} keyField="id" /></Card>}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Новая аренда">
        <div className={styles.form}>
          <Select label="Автомобиль" options={activeCars.map(c => ({ value: c.id, label: `${c.brand} ${c.model}` }))} value={formData.carId} onChange={(e) => setFormData({ ...formData, carId: e.target.value })} required />
          <Input label="Имя арендатора" value={formData.renterName} onChange={(e) => setFormData({ ...formData, renterName: e.target.value })} required />
          <Input label="Дата начала" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
          <Input label="Дата окончания" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
          <div className={styles.formActions}><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleSubmit}>Создать</Button></div>
        </div>
      </Modal>
    </div>
  );
});
