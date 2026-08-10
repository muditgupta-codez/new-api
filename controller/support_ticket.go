package controller

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

// ---- Shared DTOs ----

type SupportTicketCreateRequest struct {
	Subject  string `json:"subject" binding:"required"`
	Category string `json:"category"`
	Priority int    `json:"priority"`
	Content  string `json:"content" binding:"required"`
}

type SupportTicketReplyRequest struct {
	Content string `json:"content" binding:"required"`
}

type SupportTicketDTO struct {
	Ticket    model.SupportTicket          `json:"ticket"`
	Messages  []model.SupportTicketMessage `json:"messages,omitempty"`
	UserName  string                       `json:"user_name,omitempty"`
	UserEmail string                       `json:"user_email,omitempty"`
}

func validateTicketContent(content string) error {
	content = strings.TrimSpace(content)
	if content == "" {
		return errors.New("message content cannot be empty")
	}
	if len(content) > 10000 {
		return errors.New("message content is too long (max 10000 characters)")
	}
	return nil
}

// ---- User APIs ----

// CreateSupportTicket creates a new ticket with the first message.
func CreateSupportTicket(c *gin.Context) {
	userId := c.GetInt("id")
	var req SupportTicketCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, errors.New("subject and content are required"))
		return
	}
	req.Subject = strings.TrimSpace(req.Subject)
	if req.Subject == "" {
		common.ApiError(c, errors.New("subject cannot be empty"))
		return
	}
	if len(req.Subject) > 255 {
		common.ApiError(c, errors.New("subject is too long (max 255 characters)"))
		return
	}
	if err := validateTicketContent(req.Content); err != nil {
		common.ApiError(c, err)
		return
	}
	if req.Priority < model.SupportTicketPriorityLow || req.Priority > model.SupportTicketPriorityUrgent {
		req.Priority = model.SupportTicketPriorityNormal
	}
	if req.Category == "" {
		req.Category = "general"
	}

	ticket := &model.SupportTicket{
		UserId:   userId,
		Subject:  req.Subject,
		Category: req.Category,
		Priority: req.Priority,
		Status:   model.SupportTicketStatusOpen,
	}
	if err := model.CreateSupportTicket(ticket, req.Content); err != nil {
		common.ApiError(c, err)
		return
	}
	go notifyAdminsNewTicket(ticket)
	common.ApiSuccess(c, ticket)
}

// GetMySupportTickets lists the current user's tickets, newest first.
func GetMySupportTickets(c *gin.Context) {
	userId := c.GetInt("id")
	pageInfo := common.GetPageQuery(c)
	tickets, total, err := model.GetUserSupportTickets(userId, pageInfo.GetStartIdx(), pageInfo.GetPageSize())
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(tickets)
	common.ApiSuccess(c, pageInfo)
}

// GetMySupportTicket returns one of the user's tickets with its full message thread.
func GetMySupportTicket(c *gin.Context) {
	userId := c.GetInt("id")
	ticket, err := model.GetSupportTicketById(parseIdParam(c))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if ticket.UserId != userId {
		common.ApiError(c, model.ErrSupportTicketNotOwner)
		return
	}
	messages, err := model.GetSupportTicketMessages(ticket.Id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, SupportTicketDTO{Ticket: *ticket, Messages: messages})
}

// ReplySupportTicket adds a user reply and reopens the ticket.
func ReplySupportTicket(c *gin.Context) {
	userId := c.GetInt("id")
	id := parseIdParam(c)
	ticket, err := model.GetSupportTicketById(id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if ticket.UserId != userId {
		common.ApiError(c, model.ErrSupportTicketNotOwner)
		return
	}
	if ticket.Status == model.SupportTicketStatusClosed {
		common.ApiError(c, model.ErrSupportTicketClosed)
		return
	}
	var req SupportTicketReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, errors.New("content is required"))
		return
	}
	if err := validateTicketContent(req.Content); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.AddSupportTicketMessage(ticket.Id, userId, false, req.Content); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.UpdateSupportTicketStatus(ticket.Id, model.SupportTicketStatusOpen); err != nil {
		common.ApiError(c, err)
		return
	}
	_ = model.UpdateSupportTicketLastActivity(ticket.Id)
	go notifyAdminsNewReply(ticket)
	common.ApiSuccess(c, gin.H{"success": true})
}

// CloseSupportTicket closes a ticket (user side).
func CloseSupportTicket(c *gin.Context) {
	userId := c.GetInt("id")
	id := parseIdParam(c)
	ticket, err := model.GetSupportTicketById(id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if ticket.UserId != userId {
		common.ApiError(c, model.ErrSupportTicketNotOwner)
		return
	}
	if err := model.UpdateSupportTicketStatus(ticket.Id, model.SupportTicketStatusClosed); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{"success": true})
}

// ---- Admin APIs ----

// AdminListSupportTickets lists all tickets, optional ?status=1|2|3 filter.
func AdminListSupportTickets(c *gin.Context) {
	status, _ := strconv.Atoi(c.Query("status"))
	pageInfo := common.GetPageQuery(c)
	tickets, total, err := model.GetAllSupportTickets(status, pageInfo.GetStartIdx(), pageInfo.GetPageSize())
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(tickets)
	common.ApiSuccess(c, pageInfo)
}

// AdminGetSupportTicket returns a ticket + thread + owner info for admins.
func AdminGetSupportTicket(c *gin.Context) {
	ticket, err := model.GetSupportTicketById(parseIdParam(c))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	messages, err := model.GetSupportTicketMessages(ticket.Id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	dto := SupportTicketDTO{Ticket: *ticket, Messages: messages}
	if user, err := model.GetUserById(ticket.UserId, false); err == nil {
		dto.UserName = user.Username
		dto.UserEmail = user.Email
	}
	common.ApiSuccess(c, dto)
}

// AdminReplySupportTicket adds a staff reply; status moves to "replied".
func AdminReplySupportTicket(c *gin.Context) {
	adminId := c.GetInt("id")
	ticket, err := model.GetSupportTicketById(parseIdParam(c))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if ticket.Status == model.SupportTicketStatusClosed {
		common.ApiError(c, model.ErrSupportTicketClosed)
		return
	}
	var req SupportTicketReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiError(c, errors.New("content is required"))
		return
	}
	if err := validateTicketContent(req.Content); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.AddSupportTicketMessage(ticket.Id, adminId, true, req.Content); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.UpdateSupportTicketStatus(ticket.Id, model.SupportTicketStatusReplied); err != nil {
		common.ApiError(c, err)
		return
	}
	_ = model.UpdateSupportTicketLastActivity(ticket.Id)
	go notifyUserReply(ticket)
	common.ApiSuccess(c, gin.H{"success": true})
}

// AdminUpdateSupportTicketStatus sets status explicitly (open/replied/closed).
func AdminUpdateSupportTicketStatus(c *gin.Context) {
	ticket, err := model.GetSupportTicketById(parseIdParam(c))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	status, _ := strconv.Atoi(c.Query("status"))
	if status < model.SupportTicketStatusOpen || status > model.SupportTicketStatusClosed {
		common.ApiError(c, errors.New("invalid status"))
		return
	}
	if err := model.UpdateSupportTicketStatus(ticket.Id, status); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{"success": true})
}

// AdminDeleteSupportTicket deletes a ticket and its messages.
func AdminDeleteSupportTicket(c *gin.Context) {
	id := parseIdParam(c)
	if _, err := model.GetSupportTicketById(id); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.DeleteSupportTicket(id); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{"success": true})
}

// ---- Helpers ----

func parseIdParam(c *gin.Context) int {
	id, _ := strconv.Atoi(c.Param("id"))
	return id
}

func ticketEmailHTML(header, body string) string {
	escaped := strings.ReplaceAll(body, "\n", "<br/>")
	return fmt.Sprintf("<h3>%s</h3><p>%s</p><p style='color:#888;font-size:12px'>— Zeskai Support</p>", header, escaped)
}

// notifyAdminsNewTicket emails all admins when a user opens a ticket (best-effort, async).
func notifyAdminsNewTicket(ticket *model.SupportTicket) {
	admins, err := model.GetAllAdmins()
	if err != nil {
		return
	}
	subject := fmt.Sprintf("[Zeskai] New support ticket: %s", ticket.Subject)
	for _, admin := range admins {
		if admin.Email == "" {
			continue
		}
		body := fmt.Sprintf("User #%d opened a new ticket (priority %d):<br/><strong>%s</strong><br/><br/>View it in the admin panel at https://zeskai.com/support/admin/%d",
			ticket.UserId, ticket.Priority, ticket.Subject, ticket.Id)
		_ = common.SendEmail(subject, admin.Email, ticketEmailHTML(subject, body))
	}
}

// notifyAdminsNewReply emails admins when a user replies to a ticket (best-effort, async).
func notifyAdminsNewReply(ticket *model.SupportTicket) {
	admins, err := model.GetAllAdmins()
	if err != nil {
		return
	}
	subject := fmt.Sprintf("[Zeskai] User replied to ticket: %s", ticket.Subject)
	for _, admin := range admins {
		if admin.Email == "" {
			continue
		}
		body := fmt.Sprintf("Ticket #%d got a new user reply.<br/>View it at https://zeskai.com/support/admin/%d", ticket.Id, ticket.Id)
		_ = common.SendEmail(subject, admin.Email, ticketEmailHTML(subject, body))
	}
}

// notifyUserReply emails the ticket owner when staff replies (best-effort, async).
func notifyUserReply(ticket *model.SupportTicket) {
	user, err := model.GetUserById(ticket.UserId, false)
	if err != nil || user.Email == "" {
		return
	}
	subject := fmt.Sprintf("[Zeskai] Support replied to your ticket: %s", ticket.Subject)
	body := fmt.Sprintf("Support replied to your ticket <strong>#%d</strong>.<br/><br/>View the thread at https://zeskai.com/support/%d", ticket.Id, ticket.Id)
	_ = common.SendEmail(subject, user.Email, ticketEmailHTML(subject, body))
}

var _ = http.StatusOK // keep net/http import if unused later
