package model

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

// Support ticket statuses
const (
	SupportTicketStatusOpen    = 1 // awaiting staff response
	SupportTicketStatusReplied = 2 // staff replied, awaiting user
	SupportTicketStatusClosed  = 3
)

// Support ticket priorities
const (
	SupportTicketPriorityLow    = 1
	SupportTicketPriorityNormal = 2
	SupportTicketPriorityHigh   = 3
	SupportTicketPriorityUrgent = 4
)

var (
	ErrSupportTicketNotFound     = errors.New("support ticket not found")
	ErrSupportTicketClosed       = errors.New("support ticket is closed")
	ErrSupportTicketNotOwner     = errors.New("support ticket does not belong to user")
	ErrSupportTicketMessageEmpty = errors.New("message content cannot be empty")
)

type SupportTicket struct {
	Id        int    `json:"id"`
	UserId    int    `json:"user_id" gorm:"type:int;index"`
	Subject   string `json:"subject" gorm:"type:varchar(255);not null"`
	Category  string `json:"category" gorm:"type:varchar(64);default:'general'"`
	Priority  int    `json:"priority" gorm:"type:int;default:1"`
	Status    int    `json:"status" gorm:"type:int;default:1;index"`
	CreatedAt int64  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt int64  `json:"updated_at" gorm:"autoUpdateTime"`
}

type SupportTicketMessage struct {
	Id        int    `json:"id"`
	TicketId  int    `json:"ticket_id" gorm:"type:int;index"`
	UserId    int    `json:"user_id" gorm:"type:int;index"` // sender; 0 = system
	IsAdmin   bool   `json:"is_admin" gorm:"default:false"`
	Content   string `json:"content" gorm:"type:text;not null"`
	CreatedAt int64  `json:"created_at" gorm:"autoCreateTime"`
}

func (t *SupportTicket) NormalizeDefaults() {
	if t.Category == "" {
		t.Category = "general"
	}
	if t.Priority == 0 {
		t.Priority = SupportTicketPriorityNormal
	}
	if t.Status == 0 {
		t.Status = SupportTicketStatusOpen
	}
}

// ---- Ticket queries ----

func CreateSupportTicket(ticket *SupportTicket, firstMessage string) error {
	ticket.NormalizeDefaults()
	err := DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(ticket).Error; err != nil {
			return err
		}
		msg := &SupportTicketMessage{
			TicketId: ticket.Id,
			UserId:   ticket.UserId,
			Content:  firstMessage,
		}
		return tx.Create(msg).Error
	})
	return err
}

func GetSupportTicketById(id int) (*SupportTicket, error) {
	var ticket SupportTicket
	err := DB.Where("id = ?", id).First(&ticket).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrSupportTicketNotFound
		}
		return nil, err
	}
	ticket.NormalizeDefaults()
	return &ticket, nil
}

// GetUserSupportTickets returns a user's tickets, newest first.
func GetUserSupportTickets(userId int, startIdx, pageSize int) ([]SupportTicket, int64, error) {
	var tickets []SupportTicket
	var total int64
	query := DB.Model(&SupportTicket{}).Where("user_id = ?", userId)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	err := query.Order("updated_at desc, id desc").Limit(pageSize).Offset(startIdx).Find(&tickets).Error
	if err != nil {
		return nil, 0, err
	}
	for i := range tickets {
		tickets[i].NormalizeDefaults()
	}
	return tickets, total, nil
}

// GetAllSupportTickets returns all tickets (admin), newest updated first, optional status filter.
func GetAllSupportTickets(status int, startIdx, pageSize int) ([]SupportTicket, int64, error) {
	var tickets []SupportTicket
	var total int64
	query := DB.Model(&SupportTicket{})
	if status > 0 {
		query = query.Where("status = ?", status)
	}
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	err := query.Order("updated_at desc, id desc").Limit(pageSize).Offset(startIdx).Find(&tickets).Error
	if err != nil {
		return nil, 0, err
	}
	for i := range tickets {
		tickets[i].NormalizeDefaults()
	}
	return tickets, total, nil
}

// UpdateSupportTicketStatus transitions a ticket open/replied/closed. Returns ErrSupportTicketNotFound if missing.
func UpdateSupportTicketStatus(id int, status int) error {
	ticket, err := GetSupportTicketById(id)
	if err != nil {
		return err
	}
	ticket.Status = status
	ticket.UpdatedAt = time.Now().Unix()
	return DB.Model(&SupportTicket{}).Where("id = ?", id).Update("status", status).Update("updated_at", ticket.UpdatedAt).Error
}

// UpdateSupportTicketLastActivity bumps the updated_at timestamp (used on new messages).
func UpdateSupportTicketLastActivity(id int) error {
	return DB.Model(&SupportTicket{}).Where("id = ?", id).
		Update("updated_at", time.Now().Unix()).Error
}

func DeleteSupportTicket(id int) error {
	return DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("ticket_id = ?", id).Delete(&SupportTicketMessage{}).Error; err != nil {
			return err
		}
		return tx.Where("id = ?", id).Delete(&SupportTicket{}).Error
	})
}

// ---- Message queries ----

func GetSupportTicketMessages(ticketId int) ([]SupportTicketMessage, error) {
	var messages []SupportTicketMessage
	err := DB.Where("ticket_id = ?", ticketId).Order("id asc").Find(&messages).Error
	return messages, err
}

func AddSupportTicketMessage(ticketId, userId int, isAdmin bool, content string) error {
	msg := &SupportTicketMessage{
		TicketId: ticketId,
		UserId:   userId,
		IsAdmin:  isAdmin,
		Content:  content,
	}
	return DB.Create(msg).Error
}
