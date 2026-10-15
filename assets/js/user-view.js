/* Shared by user-view-account.html and user-view-security.html: profile card, edit modal, suspend, tab links. */
const UserView = (() => {
  let users = Store.get('users');
  const user = users.find(u => u.id === Number(U.param('id'))) || users[0];
  const esc = U.esc;
  const save = () => Store.set('users', users);

  document.querySelectorAll('[data-user-tab]').forEach(a => { a.href = `${a.dataset.userTab}?id=${user.id}`; });

  const modalEl = document.createElement('div');
  modalEl.className = 'modal fade';
  modalEl.tabIndex = -1;
  modalEl.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <form class="modal-content" novalidate>
        <div class="modal-header"><h5 class="modal-title">Edit User Information</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
        <div class="modal-body row g-3">
          <div class="col-md-6"><label class="form-label" for="evName">Full name</label><input class="form-control" id="evName" required><div class="invalid-feedback">Name is required.</div></div>
          <div class="col-md-6"><label class="form-label" for="evUsername">Username</label><input class="form-control" id="evUsername" required><div class="invalid-feedback">Username is required.</div></div>
          <div class="col-md-6"><label class="form-label" for="evEmail">Email</label><input type="email" class="form-control" id="evEmail" required><div class="invalid-feedback">Enter a valid email.</div></div>
          <div class="col-md-6"><label class="form-label" for="evPhone">Contact</label><input class="form-control" id="evPhone"></div>
          <div class="col-md-4"><label class="form-label" for="evRole">Role</label><select class="form-select" id="evRole">${SEED.lookups.roles.map(r => `<option>${r}</option>`).join('')}</select></div>
          <div class="col-md-4"><label class="form-label" for="evPlan">Plan</label><select class="form-select" id="evPlan">${SEED.lookups.plans.map(r => `<option>${r}</option>`).join('')}</select></div>
          <div class="col-md-4"><label class="form-label" for="evStatus">Status</label><select class="form-select" id="evStatus"><option>Active</option><option>Pending</option><option>Inactive</option></select></div>
          <div class="col-md-6"><label class="form-label" for="evCountry">Country</label><select class="form-select" id="evCountry">${SEED.lookups.countries.map(r => `<option>${r}</option>`).join('')}</select></div>
        </div>
        <div class="modal-footer"><button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-primary">Save changes</button></div>
      </form>
    </div>`;
  document.body.append(modalEl);
  const modal = new bootstrap.Modal(modalEl);
  const form = modalEl.querySelector('form');
  const f = id => modalEl.querySelector(`#${id}`);

  function renderCard() {
    const el = document.getElementById('userCard');
    el.innerHTML = `
      <div class="card-body text-center pt-5">
        <span class="avatar avatar-xl avatar-rounded bg-label-${U.colorFor(user.name)} mb-3">${esc(U.initials(user.name))}</span>
        <h5 class="mb-1">${esc(user.name)}</h5>
        ${U.badge(user.role)}
        <div class="d-flex justify-content-around flex-wrap gap-3 my-4">
          <div class="d-flex align-items-center gap-2"><span class="stat-icon bg-label-primary"><i class="bx bx-check"></i></span><div class="text-start"><h6 class="mb-0">${1 + (user.id * 37) % 2000}</h6><small>Tasks done</small></div></div>
          <div class="d-flex align-items-center gap-2"><span class="stat-icon bg-label-primary"><i class="bx bx-briefcase"></i></span><div class="text-start"><h6 class="mb-0">${1 + (user.id * 13) % 600}</h6><small>Projects done</small></div></div>
        </div>
      </div>
      <div class="card-body pt-0">
        <h6 class="pb-2 border-bottom mb-3">Details</h6>
        <ul class="list-unstyled mb-4">
          <li class="mb-2"><span class="fw-medium text-heading me-1">Username:</span>@${esc(user.username)}</li>
          <li class="mb-2"><span class="fw-medium text-heading me-1">Email:</span>${esc(user.email)}</li>
          <li class="mb-2"><span class="fw-medium text-heading me-1">Status:</span>${U.badge(user.status)}</li>
          <li class="mb-2"><span class="fw-medium text-heading me-1">Role:</span>${esc(user.role)}</li>
          <li class="mb-2"><span class="fw-medium text-heading me-1">Plan:</span>${esc(user.plan)}</li>
          <li class="mb-2"><span class="fw-medium text-heading me-1">Contact:</span>${esc(user.phone)}</li>
          <li class="mb-2"><span class="fw-medium text-heading me-1">Country:</span>${esc(user.country)}</li>
          <li><span class="fw-medium text-heading me-1">Joined:</span>${U.date(user.joined)}</li>
        </ul>
        <div class="d-flex justify-content-center gap-2">
          <button type="button" class="btn btn-primary" data-edit>Edit</button>
          <button type="button" class="btn btn-label-danger" data-suspend>${user.status === 'Inactive' ? 'Activate' : 'Suspend'}</button>
        </div>
      </div>`;
    document.querySelector('.page-header h4').textContent = user.name;
  }

  document.getElementById('userCard').addEventListener('click', async e => {
    if (e.target.closest('[data-edit]')) {
      form.classList.remove('was-validated');
      f('evName').value = user.name; f('evUsername').value = user.username; f('evEmail').value = user.email; f('evPhone').value = user.phone;
      f('evRole').value = user.role; f('evPlan').value = user.plan; f('evStatus').value = user.status; f('evCountry').value = user.country;
      modal.show();
    }
    if (e.target.closest('[data-suspend]')) {
      const suspend = user.status !== 'Inactive';
      if (suspend && !(await U.confirm(`${user.name} won't be able to sign in until reactivated.`, { title: 'Suspend user?', okText: 'Yes, suspend' }))) return;
      user.status = suspend ? 'Inactive' : 'Active';
      save();
      renderCard();
      U.toast(suspend ? 'User suspended' : 'User activated');
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    Object.assign(user, {
      name: f('evName').value.trim(), username: f('evUsername').value.trim(), email: f('evEmail').value.trim(), phone: f('evPhone').value.trim(),
      role: f('evRole').value, plan: f('evPlan').value, status: f('evStatus').value, country: f('evCountry').value
    });
    save();
    renderCard();
    modal.hide();
    U.toast('User updated');
  });

  renderCard();
  return { user };
})();
